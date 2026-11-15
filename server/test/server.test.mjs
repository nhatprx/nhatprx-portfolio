import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHmac } from 'node:crypto'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import test, { after, before } from 'node:test'

const SERVER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PASSKEY = 'integration-test-passkey'

let child
let baseUrl
let secretDir

// Boots the real server on a throwaway port with throwaway secrets, so this
// exercises the same code path as production and local dev.
before(async () => {
  secretDir = mkdtempSync(join(tmpdir(), 'nhatprx-api-'))
  const salt = Buffer.from('00112233445566778899aabbccddeeff', 'hex')
  const { pbkdf2Sync } = await import('node:crypto')
  const digest = pbkdf2Sync(PASSKEY, salt, 200_000, 32, 'sha256')
  writeFileSync(join(secretDir, 'passkey.hash'), `${salt.toString('hex')}:${digest.toString('hex')}`)
  writeFileSync(join(secretDir, 'token.secret'), Buffer.from('0123456789abcdef0123456789abcdef'))

  const port = 8900 + Math.floor(Math.random() * 90)
  baseUrl = `http://127.0.0.1:${port}`

  child = spawn(process.execPath, ['index.mjs'], {
    cwd: SERVER_DIR,
    env: {
      ...process.env,
      PORT: String(port),
      PASSKEY_HASH_FILE: join(secretDir, 'passkey.hash'),
      TOKEN_SECRET_FILE: join(secretDir, 'token.secret'),
    },
    stdio: 'ignore',
  })

  // Wait for the listener to come up.
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/health`)
      if (res.ok) return
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  throw new Error('server did not start in time')
})

after(() => {
  child?.kill()
})

test('health responds', async () => {
  const res = await fetch(`${baseUrl}/api/health`)
  assert.equal(res.status, 200)
})

test('login with the correct passkey returns a token', async () => {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey: PASSKEY }),
  })
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.ok(body.token, 'expected a token in the response body')
})

test('login with a wrong passkey is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey: 'wrong-passkey' }),
  })
  assert.equal(res.status, 401)
})

test('a token from login authorizes a protected request', async () => {
  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey: PASSKEY }),
  })
  const { token } = await login.json()

  // /api/resume/presign validates the file before touching S3, so a 400 here
  // proves the token was accepted (an unauthenticated call answers 401).
  const res = await fetch(`${baseUrl}/api/resume/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileName: '', contentType: 'application/pdf', size: 10 }),
  })
  assert.equal(res.status, 400)
})

test('a protected request without a token is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/resume/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'a.pdf', contentType: 'application/pdf', size: 10 }),
  })
  assert.equal(res.status, 401)
})

/**
 * Performs a signed terminal request, exactly like the browser does:
 * fetch a token bound to the client id, then HMAC-sign the command.
 */
async function signedExec(command, { clientId = 'test_client_1', token, tamper } = {}) {
  let terminalToken = token
  if (!terminalToken) {
    const tokenRes = await fetch(`${baseUrl}/api/terminal/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    terminalToken = (await tokenRes.json()).token
  }

  const timestamp = Date.now()
  const payload = `${clientId}|${timestamp}|${command}`
  const signature = createHmac('sha256', terminalToken).update(payload).digest('hex')

  return fetch(`${baseUrl}/api/terminal/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Signature': tamper ? 'deadbeef'.repeat(8) : signature,
      'X-Client-Id': clientId,
      'X-Terminal-Token': terminalToken,
      'X-Timestamp': String(timestamp),
    },
    body: JSON.stringify({ command }),
  })
}

test('the terminal executes an allowlisted command', async () => {
  const res = await signedExec('hostname')
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.ok(body.stdout, 'expected stdout in the response body')
})

test('the terminal rejects a command outside the allowlist', async () => {
  const res = await signedExec('rm -rf /')
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.ok(body.error, 'expected an error message')
})

test('the terminal does not leak command errors as 200', async () => {
  const res = await signedExec('')
  assert.equal(res.status, 400)
})

test('the terminal rejects an unsigned request', async () => {
  const res = await fetch(`${baseUrl}/api/terminal/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'hostname' }),
  })
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.match(body.error, /Missing security headers/)
})

test('the terminal rejects a forged signature', async () => {
  const res = await signedExec('hostname', { tamper: true })
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.match(body.error, /Invalid request signature/)
})

test('the terminal rejects a token minted for another client id', async () => {
  // A token issued for client A must not authorise client B.
  const tokenRes = await fetch(`${baseUrl}/api/terminal/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: 'test_client_a' }),
  })
  const token = (await tokenRes.json()).token

  const res = await signedExec('hostname', { clientId: 'test_client_b', token })
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.match(body.error, /Invalid or expired terminal token/)
})

test('the terminal rejects an expired timestamp', async () => {
  const tokenRes = await fetch(`${baseUrl}/api/terminal/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: 'test_client_stale' }),
  })
  const token = (await tokenRes.json()).token

  const staleTimestamp = Date.now() - 10 * 60 * 1000
  const payload = `test_client_stale|${staleTimestamp}|hostname`
  const signature = createHmac('sha256', token).update(payload).digest('hex')

  const res = await fetch(`${baseUrl}/api/terminal/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Signature': signature,
      'X-Client-Id': 'test_client_stale',
      'X-Terminal-Token': token,
      'X-Timestamp': String(staleTimestamp),
    },
    body: JSON.stringify({ command: 'hostname' }),
  })
  assert.equal(res.status, 400)
  const body = await res.json()
  assert.match(body.error, /timestamp expired/)
})
