import assert from 'node:assert/strict'
import test from 'node:test'
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'

// Mirrors the auth primitives in ../index.mjs so they can be tested without
// booting the HTTP server or touching AWS.

function hashPasskey(passkey, salt) {
  return pbkdf2Sync(passkey, salt, 200_000, 32, 'sha256')
}

function makeToken(secret, now = Date.now()) {
  const expiry = Math.floor(now / 1000) + 12 * 3600
  const payload = `admin.${expiry}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function checkToken(secret, token, now = Date.now()) {
  if (typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [prefix, expiryRaw, sig] = parts
  if (prefix !== 'admin') return false
  const expiry = Number(expiryRaw)
  if (!Number.isFinite(expiry) || expiry < Math.floor(now / 1000)) return false
  const expected = createHmac('sha256', secret).update(`admin.${expiryRaw}`).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  return a.length === b.length && timingSafeEqual(a, b)
}

test('correct passkey matches the stored hash', () => {
  const salt = randomBytes(16)
  const stored = hashPasskey('correct-horse', salt)
  const actual = hashPasskey('correct-horse', salt)
  assert.ok(timingSafeEqual(stored, actual))
})

test('wrong passkey does not match the stored hash', () => {
  const salt = randomBytes(16)
  const stored = hashPasskey('correct-horse', salt)
  const actual = hashPasskey('wrong', salt)
  assert.notEqual(stored.toString('hex'), actual.toString('hex'))
})

test('a valid token verifies', () => {
  const secret = randomBytes(32)
  assert.equal(checkToken(secret, makeToken(secret)), true)
})

test('a token signed with a different secret is rejected', () => {
  const secret = randomBytes(32)
  const other = randomBytes(32)
  assert.equal(checkToken(secret, makeToken(other)), false)
})

test('an expired token is rejected', () => {
  const secret = randomBytes(32)
  const old = makeToken(secret, Date.now() - 13 * 3600 * 1000)
  assert.equal(checkToken(secret, old), false)
})

test('a tampered token payload is rejected', () => {
  const secret = randomBytes(32)
  const token = makeToken(secret)
  const tampered = token.replace(/admin\.(\d+)/, (_, exp) => `admin.${Number(exp) + 100000}`)
  assert.equal(checkToken(secret, tampered), false)
})

test('malformed tokens are rejected without throwing', () => {
  const secret = randomBytes(32)
  for (const bad of ['', 'x', 'a.b', 'a.b.c.d', null, undefined, 42, {}]) {
    assert.equal(checkToken(secret, bad), false)
  }
})