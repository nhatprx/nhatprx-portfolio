/**
 * Terminal request signing - shared by the browser and the API.
 *
 * Lives in .mjs so the Vite app (via terminalSigning.ts) and the Node API
 * (server/index.mjs) use one implementation, and so the Node test runner can
 * import it directly without a build step.
 *
 * The signature is HMAC-SHA256 over `clientId|timestamp|command` using a
 * shared secret. The browser never holds the secret: it asks the API for a
 * short-lived signing token instead.
 */

/**
 * The signature is only valid for this long.
 *
 * Kept short so a captured signature has a small replay window. A nonce
 * (below) closes the window completely for a given signature.
 */
export const SIGNATURE_WINDOW_MS = 60 * 1000

/**
 * Builds the canonical string that gets signed.
 * @param {string} clientId
 * @param {number} timestamp
 * @param {string} command
 * @param {string} [nonce] A one-time value that makes each signature unique.
 */
export function signingPayload(clientId, timestamp, command, nonce = '') {
  return `${clientId}|${timestamp}|${nonce}|${command}`
}

/**
 * Verifies a signature in constant time.
 *
 * `sign` is injected so this module stays free of a runtime-specific crypto
 * import: the API passes node:crypto, the browser passes the Web Crypto API.
 *
 * @param {(payload: string) => Promise<string>|string} sign Returns a hex digest.
 * @param {string} signature The hex digest the client sent.
 * @param {string} clientId
 * @param {number} timestamp
 * @param {string} command
 * @param {string} [nonce]
 */
export async function verifyRequest(sign, signature, clientId, timestamp, command, nonce = '') {
  if (typeof signature !== 'string' || !signature) return false
  const expected = await sign(signingPayload(clientId, timestamp, command, nonce))
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  if (a.length !== b.length || a.length === 0) return false
  return timingSafeEqualHex(a, b)
}

/**
 * Tracks the nonces that have already been used, so a captured request cannot
 * be replayed.
 *
 * Entries are kept for the length of the signature window and then dropped.
 * The map is capped so a client cannot grow it without bound.
 */
export class NonceCache {
  constructor(ttlMs = SIGNATURE_WINDOW_MS, maxKeys = 10_000) {
    this.ttlMs = ttlMs
    this.maxKeys = maxKeys
    this.seen = new Map()
  }

  /**
   * Returns true when the nonce is new (and records it), false when it was
   * already used.
   * @param {string} nonce
   * @param {number} [now]
   */
  claim(nonce, now = Date.now()) {
    if (!nonce) return false
    this.prune(now)
    if (this.seen.has(nonce)) return false
    if (this.seen.size >= this.maxKeys) {
      const oldest = this.seen.keys().next().value
      if (oldest !== undefined) this.seen.delete(oldest)
    }
    this.seen.set(nonce, now + this.ttlMs)
    return true
  }

  prune(now = Date.now()) {
    for (const [nonce, expiresAt] of this.seen) {
      if (now >= expiresAt) this.seen.delete(nonce)
    }
  }
}

/**
 * Compares two byte buffers in constant time.
 * Kept local so the browser path does not need node:crypto.
 */
function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

/**
 * Checks that the timestamp is inside the allowed window.
 * @param {number} timestamp
 * @param {number} [now]
 */
export function isTimestampFresh(timestamp, now = Date.now()) {
  if (!Number.isFinite(timestamp)) return false
  return Math.abs(now - timestamp) <= SIGNATURE_WINDOW_MS
}
