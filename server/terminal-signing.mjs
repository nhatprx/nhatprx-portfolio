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

/** The signature is only valid for this long. */
export const SIGNATURE_WINDOW_MS = 5 * 60 * 1000

/**
 * Builds the canonical string that gets signed.
 * @param {string} clientId
 * @param {number} timestamp
 * @param {string} command
 */
export function signingPayload(clientId, timestamp, command) {
  return `${clientId}|${timestamp}|${command}`
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
 */
export async function verifyRequest(sign, signature, clientId, timestamp, command) {
  if (typeof signature !== 'string' || !signature) return false
  const expected = await sign(signingPayload(clientId, timestamp, command))
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  if (a.length !== b.length || a.length === 0) return false
  return timingSafeEqualHex(a, b)
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
