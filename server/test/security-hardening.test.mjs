import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveClientIp, checkRateLimit, clearRateLimit } from '../rate-limit.mjs'
import { NonceCache, signingPayload, SIGNATURE_WINDOW_MS } from '../terminal-signing.mjs'
import { sanitizeTerminalOutput } from '../terminal-security.mjs'

// These tests cover the hardening that closed the H1/H2 findings: the rate
// limit key must come from the real client IP, and a signed request must not
// be replayable.

test('Security - client IP resolution', async t => {
  await t.test('trusts X-Real-IP because nginx overwrites it', () => {
    const req = { headers: { 'x-real-ip': '203.0.113.7' }, socket: { remoteAddress: '127.0.0.1' } }
    assert.strictEqual(resolveClientIp(req), '203.0.113.7')
  })

  await t.test('ignores X-Forwarded-For because the client controls it', () => {
    // nginx appends to X-Forwarded-For instead of replacing it, so the first
    // entry is whatever the client sent.
    const req = {
      headers: { 'x-forwarded-for': '10.0.0.1, 203.0.113.9' },
      socket: { remoteAddress: '127.0.0.1' },
    }
    assert.strictEqual(resolveClientIp(req), '127.0.0.1')
  })

  await t.test('takes the first entry of a chained X-Real-IP', () => {
    const req = { headers: { 'x-real-ip': '203.0.113.7, 198.51.100.2' }, socket: {} }
    assert.strictEqual(resolveClientIp(req), '203.0.113.7')
  })

  await t.test('falls back to the socket address', () => {
    const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } }
    assert.strictEqual(resolveClientIp(req), '127.0.0.1')
  })

  await t.test('never returns an empty client ip', () => {
    const req = { headers: { 'x-real-ip': '   ' }, socket: {} }
    assert.strictEqual(resolveClientIp(req), 'unknown')
  })
})

test('Security - rate limit cannot be spread over rotating client ids', async t => {
  await t.test('one IP shares a single budget', () => {
    const map = new Map()
    const policy = { windowMs: 60_000, max: 60 }
    // The key is the IP only, so rotating client ids must not buy more budget.
    for (let i = 0; i < 60; i++) {
      assert.strictEqual(checkRateLimit(map, '203.0.113.7', policy).allowed, true)
    }
    assert.strictEqual(checkRateLimit(map, '203.0.113.7', policy).allowed, false)
  })

  await t.test('different IPs have separate budgets', () => {
    const map = new Map()
    const policy = { windowMs: 60_000, max: 5 }
    for (let i = 0; i < 5; i++) checkRateLimit(map, '203.0.113.7', policy)
    assert.strictEqual(checkRateLimit(map, '203.0.113.7', policy).allowed, false)
    assert.strictEqual(checkRateLimit(map, '198.51.100.2', policy).allowed, true)
  })

  await t.test('a successful login clears the attempt budget', () => {
    const map = new Map()
    const policy = { windowMs: 60_000, max: 3 }
    checkRateLimit(map, '203.0.113.7', policy)
    checkRateLimit(map, '203.0.113.7', policy)
    clearRateLimit(map, '203.0.113.7')
    assert.strictEqual(checkRateLimit(map, '203.0.113.7', policy).allowed, true)
  })

  await t.test('the map stays bounded', () => {
    const map = new Map()
    const policy = { windowMs: 60_000, max: 60 }
    const now = Date.now()
    for (let i = 0; i < 10_500; i++) checkRateLimit(map, `ip-${i}`, policy, now)
    assert(map.size <= 10_000, `map grew to ${map.size}`)
  })
})

test('Security - replay protection', async t => {
  await t.test('a nonce can only be used once', () => {
    const cache = new NonceCache()
    assert.strictEqual(cache.claim('nonce-1'), true)
    assert.strictEqual(cache.claim('nonce-1'), false, 'the same nonce must be rejected')
  })

  await t.test('an empty nonce is never accepted', () => {
    const cache = new NonceCache()
    assert.strictEqual(cache.claim(''), false)
  })

  await t.test('a nonce expires with the signature window', () => {
    const cache = new NonceCache(1000)
    const now = Date.now()
    assert.strictEqual(cache.claim('nonce-1', now), true)
    assert.strictEqual(cache.claim('nonce-1', now + 2000), true, 'an expired nonce may be reused')
  })

  await t.test('the nonce is part of the signed payload', () => {
    const a = signingPayload('client', 1000, 'uptime', 'nonce-a')
    const b = signingPayload('client', 1000, 'uptime', 'nonce-b')
    assert.notStrictEqual(a, b, 'a different nonce must produce a different payload')
  })

  await t.test('the signature window is short', () => {
    assert(SIGNATURE_WINDOW_MS <= 60_000, 'the replay window should be at most one minute')
  })
})

test('Security - output sanitization covers the missing secret names', async t => {
  const cases = [
    ['secret: hunter2', 'hunter2'],
    ['passwd: hunter2', 'hunter2'],
    ['authorization: Bearer abc123def456', 'abc123def456'],
    ['bearer abc123def456ghi', 'abc123def456ghi'],
    ['private_key: -----BEGIN', 'BEGIN'],
    ['x-amz-signature: deadbeefcafe', 'deadbeefcafe'],
    ['password=hunter2', 'hunter2'],
  ]

  for (const [input, secret] of cases) {
    const out = sanitizeTerminalOutput(input)
    assert(!out.includes(secret), `"${secret}" leaked from "${input}"`)
  }

  await t.test('masks JSON web tokens', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    const out = sanitizeTerminalOutput(`token=${jwt}`)
    assert(!out.includes(jwt), 'the JWT leaked')
  })

  await t.test('keeps ordinary output readable', () => {
    const out = sanitizeTerminalOutput('Linux nhatprx-server 5.15.0 x86_64')
    assert(out.includes('nhatprx-server'), 'ordinary output should survive')
  })
})
