/**
 * Terminal security primitives - shared by the API and the test suite.
 *
 * Lives in .mjs so the API can import it directly and the Node test runner
 * can exercise the real functions instead of a copy that could drift.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { verifyRequest, isTimestampFresh } from './terminal-signing.mjs'

/** Rate limiting: 60 requests per 60 seconds per key. */
export const RATE_LIMIT_WINDOW = 60000
export const RATE_LIMIT_MAX = 60
/**
 * The rate limit map is keyed by a client-controlled id, so it needs a cap.
 * Without one an attacker can grow the map without bound.
 */
export const RATE_LIMIT_MAX_KEYS = 10_000

/**
 * Checks and updates the rate limit for a key.
 * @param {Map<string, {count: number, resetTime: number}>} map
 * @param {string} key
 * @param {number} [now]
 * @returns {{allowed: boolean, resetIn: number}}
 */
export function checkRateLimit(map, key, now = Date.now()) {
  let state = map.get(key)
  if (!state || now >= state.resetTime) {
    if (map.size >= RATE_LIMIT_MAX_KEYS) {
      // Drop expired entries first; only then evict the oldest one.
      for (const [k, v] of map) {
        if (now >= v.resetTime) map.delete(k)
      }
      if (map.size >= RATE_LIMIT_MAX_KEYS) {
        const oldest = map.keys().next().value
        if (oldest !== undefined) map.delete(oldest)
      }
    }
    state = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
    map.set(key, state)
    return { allowed: true, resetIn: 0 }
  }

  state.count++
  if (state.count > RATE_LIMIT_MAX) {
    return { allowed: false, resetIn: state.resetTime - now }
  }
  return { allowed: true, resetIn: 0 }
}

/**
 * Masks secrets and private addresses in terminal output.
 * @param {string} output
 * @param {number} [maxLength]
 */
export function sanitizeTerminalOutput(output, maxLength = 100 * 1024) {
  let out = String(output ?? '')
  out = out.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA****')
  out = out.replace(/aws_secret_access_key\s*[:=]\s*\S+/gi, 'aws_secret_access_key: ****')
  out = out.replace(/secret_access_key\s*[:=]\s*\S+/gi, 'secret_access_key: ****')
  out = out.replace(/password\s*[:=]\s*\S+/gi, 'password: ****')
  out = out.replace(/token\s*[:=]\s*\S+/gi, 'token: ****')
  out = out.replace(/api[_-]?key\s*[:=]\s*\S+/gi, 'api_key: ****')
  out = out.replace(/192\.168\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  out = out.replace(/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  out = out.replace(/172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  if (out.length > maxLength) {
    out = out.substring(0, maxLength) + '\n... (output truncated)'
  }
  return out
}

/**
 * Validates a terminal token and returns the key the client signs with.
 *
 * The token is `<clientId>.<expiry>.<hmac>` signed with the API's token
 * secret, so the browser can never mint a key for someone else's client id.
 * The token itself is the signing key: the browser knows it, and the server
 * only accepts a token it signed and that has not expired.
 *
 * @param {string} token
 * @param {string} clientId
 * @param {Buffer|string} tokenSecret
 * @param {number} [now]
 * @returns {string|null} The signing key, or null when the token is invalid.
 */
export function resolveClientSecret(token, clientId, tokenSecret, now = Date.now()) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) return null
  const [tokenClientId, expiryRaw, sig] = parts
  if (tokenClientId !== clientId) return null

  const expiry = Number(expiryRaw)
  if (!Number.isFinite(expiry) || expiry < Math.floor(now / 1000)) return null

  const expected = createHmac('sha256', tokenSecret).update(`terminal.${expiryRaw}`).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  return token
}

/**
 * Mints a terminal signing token.
 * @param {string} clientId
 * @param {Buffer|string} tokenSecret
 * @param {number} ttlSeconds
 * @param {number} [now]
 */
export function makeTerminalToken(clientId, tokenSecret, ttlSeconds, now = Date.now()) {
  const expiry = Math.floor(now / 1000) + ttlSeconds
  const sig = createHmac('sha256', tokenSecret).update(`terminal.${expiry}`).digest('hex')
  return `${clientId}.${expiry}.${sig}`
}

/**
 * Verifies a terminal request signature.
 *
 * @param {Buffer|string} tokenSecret
 * @param {{signature?: string, clientId?: string, token?: string, timestamp?: number, command?: string}} request
 * @param {number} [now]
 * @returns {{ok: boolean, error?: string, clientId?: string}}
 */
export async function validateTerminalRequest(tokenSecret, request, now = Date.now()) {
  const { signature, clientId, token, timestamp } = request
  if (!signature || !clientId || !token || !timestamp) {
    return { ok: false, error: 'Missing security headers' }
  }
  if (!isTimestampFresh(timestamp, now)) {
    return { ok: false, error: 'Request timestamp expired' }
  }

  const clientSecret = resolveClientSecret(token, clientId, tokenSecret, now)
  if (!clientSecret) {
    return { ok: false, error: 'Invalid or expired terminal token' }
  }

  const valid = await verifyRequest(
    (payload) => createHmac('sha256', clientSecret).update(payload).digest('hex'),
    signature,
    clientId,
    timestamp,
    request.command ?? ''
  )
  if (!valid) {
    return { ok: false, error: 'Invalid request signature' }
  }
  return { ok: true, clientId }
}
