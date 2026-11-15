/**
 * Request rate limiting and client IP resolution - shared by the API and the
 * test suite.
 *
 * Lives in .mjs so the API can import it directly and the Node test runner
 * can exercise the real functions instead of a copy that could drift.
 */

/**
 * Resolves the real client IP.
 *
 * The API sits behind nginx, so `req.socket.remoteAddress` is the proxy's
 * address and every request would share one rate-limit bucket. nginx sets
 * `X-Real-IP` to `$remote_addr` (the real client), and it overwrites the
 * header on every request, so it cannot be spoofed by the client.
 *
 * `X-Forwarded-For` is deliberately NOT trusted: nginx appends to it rather
 * than replacing it, so its first entry is attacker-controlled.
 *
 * @param {import('node:http').IncomingMessage} req
 * @returns {string}
 */
export function resolveClientIp(req) {
  // X-Real-IP: set by nginx as $remote_addr, overwritten on every request.
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim()) {
    // A proxy chain can append several values; the first is the client.
    const first = realIp.split(',')[0].trim()
    if (first) return first
  }
  // Fallback for running without nginx (local dev, direct calls).
  const socketIp = req.socket?.remoteAddress
  return typeof socketIp === 'string' && socketIp ? socketIp : 'unknown'
}

/**
 * A rate limit policy: how many requests are allowed inside a window.
 * @typedef {{windowMs: number, max: number}} RateLimitPolicy
 */

/**
 * The cap on tracked keys, so a client-controlled key cannot grow the map
 * without bound.
 */
export const RATE_LIMIT_MAX_KEYS = 10_000

/**
 * Checks and updates the rate limit for a key.
 *
 * The map is keyed by a caller-supplied string, so it is capped: expired
 * entries are pruned first and only then is the oldest entry evicted.
 *
 * @param {Map<string, {count: number, resetTime: number}>} map
 * @param {string} key
 * @param {{windowMs: number, max: number}} policy
 * @param {number} [now]
 * @returns {{allowed: boolean, resetIn: number}}
 */
export function checkRateLimit(map, key, policy, now = Date.now()) {
  let state = map.get(key)
  if (!state || now >= state.resetTime) {
    if (map.size >= RATE_LIMIT_MAX_KEYS) {
      for (const [k, v] of map) {
        if (now >= v.resetTime) map.delete(k)
      }
      if (map.size >= RATE_LIMIT_MAX_KEYS) {
        const oldest = map.keys().next().value
        if (oldest !== undefined) map.delete(oldest)
      }
    }
    state = { count: 1, resetTime: now + policy.windowMs }
    map.set(key, state)
    return { allowed: true, resetIn: 0 }
  }

  state.count++
  if (state.count > policy.max) {
    return { allowed: false, resetIn: state.resetTime - now }
  }
  return { allowed: true, resetIn: 0 }
}

/**
 * Removes a key from the map, e.g. to clear a limiter after a success.
 * @param {Map<string, {count: number, resetTime: number}>} map
 * @param {string} key
 */
export function clearRateLimit(map, key) {
  map.delete(key)
}
