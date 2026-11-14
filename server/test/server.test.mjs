import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
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
