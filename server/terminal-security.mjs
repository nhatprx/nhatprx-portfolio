/**
 * Terminal security primitives - shared by the API and the test suite.
 *
 * Lives in .mjs so the API can import it directly and the Node test runner
 * can exercise the real functions instead of a copy that could drift.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { verifyRequest, isTimestampFresh } from './terminal-signing.mjs'
import { checkRateLimit as checkLimit, clearRateLimit } from './rate-limit.mjs'

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
  return checkLimit(map, key, { windowMs: RATE_LIMIT_WINDOW, max: RATE_LIMIT_MAX }, now)
}

export { clearRateLimit }

/**
 * Masks secrets and private addresses in terminal output.
 *
 * The allowlist only exposes read-only inspection commands, but the API log
 * and process command lines can still contain credentials, so the patterns
 * cover the common secret-bearing key names.
 *
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
  // The remaining patterns cover key names the log or a process command line
  // may carry that the generic list above does not cover.
  out = out.replace(/secret\s*[:=]\s*\S+/gi, 'secret: ****')
  out = out.replace(/passwd\s*[:=]\s*\S+/gi, 'passwd: ****')
  out = out.replace(/authorization\s*[:=]\s*(bearer\s+)?\S+/gi, 'authorization: ****')
  out = out.replace(/bearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, 'bearer ****')
  out = out.replace(/private[_-]?key\s*[:=]\s*\S+/gi, 'private_key: ****')
  out = out.replace(/x-amz-signature\s*[:=]\s*\S+/gi, 'x-amz-signature: ****')
  out = out.replace(/x-amz-security-token\s*[:=]\s*\S+/gi, 'x-amz-security-token: ****')
  // JSON Web Tokens: three base64url segments.
  out = out.replace(/\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\b/g, '****')
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
  const { signature, clientId, token, timestamp, nonce } = request
  if (!signature || !clientId || !token || !timestamp) {
    return { ok: false, error: 'Missing security headers' }
  }
  if (!nonce) {
    return { ok: false, error: 'Missing request nonce' }
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
    request.command ?? '',
    nonce
  )
  if (!valid) {
    return { ok: false, error: 'Invalid request signature' }
  }
  return { ok: true, clientId }
}
