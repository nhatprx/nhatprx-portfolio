import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac, randomBytes } from 'node:crypto'
import {
  checkRateLimit,
  sanitizeTerminalOutput,
  makeTerminalToken,
  resolveClientSecret,
  validateTerminalRequest,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MAX_KEYS,
} from '../terminal-security.mjs'

// These tests exercise the real functions the API uses (server/terminal-security.mjs),
// so a change to the shipped code cannot silently pass the suite.

const SECRET = randomBytes(32)

test('API Security - Rate Limiting', async t => {
  await t.test('allows the first request', () => {
    const map = new Map()
    const result = checkRateLimit(map, 'test-client-1')
    assert.strictEqual(result.allowed, true)
  })

  await t.test('blocks after the limit is exceeded', () => {
    const map = new Map()
    const key = 'test-client-2'
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      assert.strictEqual(checkRateLimit(map, key).allowed, true, `request ${i + 1} should be allowed`)
    }
    const blocked = checkRateLimit(map, key)
    assert.strictEqual(blocked.allowed, false, `request ${RATE_LIMIT_MAX + 1} should be blocked`)
    assert(blocked.resetIn > 0, 'should have resetIn time')
  })

  await t.test('resets after the window expires', () => {
    const map = new Map()
    const key = 'test-client-3'
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit(map, key)
    assert.strictEqual(checkRateLimit(map, key).allowed, false)

    // Move the window into the past, as if it had elapsed.
    map.get(key).resetTime = Date.now()
    assert.strictEqual(checkRateLimit(map, key).allowed, true)
  })

  await t.test('keeps the map bounded', () => {
    // The key is client-controlled, so the map must not grow without bound.
    const map = new Map()
    const now = Date.now()
    for (let i = 0; i < RATE_LIMIT_MAX_KEYS + 500; i++) {
      checkRateLimit(map, `client-${i}`, now)
    }
    assert(map.size <= RATE_LIMIT_MAX_KEYS, `map grew to ${map.size}, expected at most ${RATE_LIMIT_MAX_KEYS}`)
  })
})

test('API Security - Output Sanitization', async t => {
  await t.test('masks AWS access keys', () => {
    const sanitized = sanitizeTerminalOutput('Your AWS key is AKIAIOSFODNN7EXAMPLE')
    assert(!sanitized.includes('AKIAIOSFODNN7EXAMPLE'))
    assert(sanitized.includes('AKIA****'))
  })

  await t.test('masks secret access keys', () => {
    const sanitized = sanitizeTerminalOutput(
      'aws_secret_access_key: wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
    )
    assert(!sanitized.includes('wJalrXUtnFEMI'))
    assert(sanitized.includes('aws_secret_access_key: ****'))
  })

  await t.test('masks passwords', () => {
    const sanitized = sanitizeTerminalOutput('database_password: super_secret_pass123')
    assert(!sanitized.includes('super_secret_pass123'))
    assert(sanitized.includes('password: ****'))
  })

  await t.test('masks API keys', () => {
    const sanitized = sanitizeTerminalOutput('api_key=sk_live_abc123def456')
    assert(!sanitized.includes('sk_live_abc123def456'))
    assert(sanitized.includes('api_key: ****'))
  })

  await t.test('masks private IP addresses', () => {
    for (const ip of ['192.168.1.100', '10.0.0.5', '172.20.1.1']) {
      const sanitized = sanitizeTerminalOutput(`Server at ${ip} is connected`)
      assert(!sanitized.includes(ip), `${ip} should be masked`)
      assert(sanitized.includes('x.x.x.x'))
    }
  })

  await t.test('truncates large outputs', () => {
    const sanitized = sanitizeTerminalOutput('a'.repeat(120 * 1024))
    assert(sanitized.length < 120 * 1024)
    assert(sanitized.includes('output truncated'))
  })

  await t.test('preserves legitimate output', () => {
    const output = 'user@host: ~$ echo "Hello World"\nHello World'
    const sanitized = sanitizeTerminalOutput(output)
    assert(sanitized.includes('Hello World'))
    assert(sanitized.includes('user@host'))
  })
})

test('API Security - Terminal Tokens', async t => {
  await t.test('a fresh token resolves to its signing key', () => {
    const token = makeTerminalToken('client_a', SECRET, 3600)
    assert.strictEqual(resolveClientSecret(token, 'client_a', SECRET), token)
  })

  await t.test('a token is bound to its client id', () => {
    const token = makeTerminalToken('client_a', SECRET, 3600)
    assert.strictEqual(resolveClientSecret(token, 'client_b', SECRET), null)
  })

  await t.test('a token signed with another secret is rejected', () => {
    const token = makeTerminalToken('client_a', randomBytes(32), 3600)
    assert.strictEqual(resolveClientSecret(token, 'client_a', SECRET), null)
  })

  await t.test('an expired token is rejected', () => {
    const token = makeTerminalToken('client_a', SECRET, 1, Date.now() - 10_000)
    assert.strictEqual(resolveClientSecret(token, 'client_a', SECRET), null)
  })

  await t.test('a malformed token is rejected', () => {
    for (const bad of ['', 'x', 'a.b', 'a.b.c.d', null, undefined]) {
      assert.strictEqual(resolveClientSecret(bad, 'client_a', SECRET), null)
    }
  })
})

test('API Security - Request Validation', async t => {
  const CLIENT_ID = 'test_client'
  const NONCE = 'test-nonce-1'

  // The signed payload includes the nonce, so a captured signature cannot be
  // replayed for a second request.
  const sign = (token, command, timestamp, nonce = NONCE) =>
    createHmac('sha256', token)
      .update(`${CLIENT_ID}|${timestamp}|${nonce}|${command}`)
      .digest('hex')

  await t.test('rejects missing signature header', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const result = await validateTerminalRequest(SECRET, {
      clientId: CLIENT_ID,
      token,
      timestamp: Date.now(),
      nonce: NONCE,
      command: 'hostname',
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /Missing security headers/)
  })

  await t.test('rejects a missing nonce', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now()
    const result = await validateTerminalRequest(SECRET, {
      signature: sign(token, 'hostname', timestamp),
      clientId: CLIENT_ID,
      token,
      timestamp,
      command: 'hostname',
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /Missing request nonce/)
  })

  await t.test('rejects missing client id header', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now()
    const result = await validateTerminalRequest(SECRET, {
      signature: sign(token, 'hostname', timestamp),
      token,
      timestamp,
      nonce: NONCE,
      command: 'hostname',
    })
    assert.strictEqual(result.ok, false)
  })

  await t.test('rejects expired timestamp', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now() - 6 * 60 * 1000
    const result = await validateTerminalRequest(SECRET, {
      signature: sign(token, 'hostname', timestamp),
      clientId: CLIENT_ID,
      token,
      timestamp,
      nonce: NONCE,
      command: 'hostname',
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /timestamp expired/)
  })

  await t.test('accepts a correctly signed request', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now()
    const result = await validateTerminalRequest(SECRET, {
      signature: sign(token, 'hostname', timestamp),
      clientId: CLIENT_ID,
      token,
      timestamp,
      nonce: NONCE,
      command: 'hostname',
    })
    assert.strictEqual(result.ok, true)
  })

  await t.test('rejects a signature made with the wrong key', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now()
    const result = await validateTerminalRequest(SECRET, {
      signature: createHmac('sha256', 'wrong-key').update(`${CLIENT_ID}|${timestamp}|${NONCE}|hostname`).digest('hex'),
      clientId: CLIENT_ID,
      token,
      timestamp,
      nonce: NONCE,
      command: 'hostname',
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /Invalid request signature/)
  })

  await t.test('rejects a signature reused for a different command', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now()
    // Signed for `hostname`, but the body asks for `uptime`.
    const result = await validateTerminalRequest(SECRET, {
      signature: sign(token, 'hostname', timestamp),
      clientId: CLIENT_ID,
      token,
      timestamp,
      nonce: NONCE,
      command: 'uptime',
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /Invalid request signature/)
  })

  await t.test('rejects a signature made with a different nonce', async () => {
    const token = makeTerminalToken(CLIENT_ID, SECRET, 3600)
    const timestamp = Date.now()
    // Signed with one nonce but sent with another.
    const result = await validateTerminalRequest(SECRET, {
      signature: sign(token, 'hostname', timestamp, 'nonce-a'),
      clientId: CLIENT_ID,
      token,
      timestamp,
      nonce: 'nonce-b',
      command: 'hostname',
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /Invalid request signature/)
  })
})
