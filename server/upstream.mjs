/**
 * Forwards terminal commands and system metrics to an upstream API.
 *
 * Local dev runs the API on Windows, where the terminal allowlist commands
 * (`uname`, `free`, `df`, ...) and the `/proc` metrics do not exist. The real
 * target is the EC2 node, so local dev points `TERMINAL_UPSTREAM` at a tunnel
 * to that node (ssh -L 8899:127.0.0.1:8787 <ec2>) and this module relays the
 * calls.
 *
 * The upstream is a plain HTTP API, not a shell: the allowlist is enforced
 * there too, so nothing user-typed can become a shell metacharacter.
 *
 * Two upstream schemes are supported, because the node's deployed API is
 * older than the local one:
 *
 *  - "token": the upstream exposes POST /api/terminal/token and verifies an
 *    HMAC-SHA256 signature over `clientId|timestamp|command`. This is what
 *    the local API does.
 *  - "legacy": the upstream only checks that the security headers are
 *    present and the timestamp is fresh. This is what the node runs today.
 *
 * The scheme is detected once per upstream and cached.
 */

import { createHmac } from 'node:crypto'
import { signingPayload } from './terminal-signing.mjs'

const DEFAULT_TIMEOUT_MS = 8_000
/** The upstream client id used by the relay. */
const UPSTREAM_CLIENT_ID = 'local_dev_upstream'

/** Caches the detected scheme per upstream base URL. */
const schemeCache = new Map()

/**
 * Signs a command the way the token scheme expects: HMAC-SHA256 over
 * `clientId|timestamp|command`, keyed by the upstream's terminal token.
 *
 * @param {string} token The terminal token issued by the upstream.
 * @param {number} timestamp
 * @param {string} command
 */
function signCommand(token, timestamp, command) {
  return createHmac('sha256', token)
    .update(signingPayload(UPSTREAM_CLIENT_ID, timestamp, command))
    .digest('hex')
}

/**
 * Signs a command the way the legacy scheme expects: base64 of
 * `command|timestamp`. The legacy upstream does not verify this value, it
 * only requires the header to be present.
 */
function legacySignature(command, timestamp) {
  return Buffer.from(`${command}|${timestamp}`).toString('base64')
}

/**
 * Detects which signing scheme the upstream supports.
 * @param {string} upstream
 * @returns {Promise<'token'|'legacy'>}
 */
async function detectScheme(upstream) {
  const cached = schemeCache.get(upstream)
  if (cached) return cached

  let scheme = 'legacy'
  try {
    const res = await fetch(`${upstream}/api/terminal/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: UPSTREAM_CLIENT_ID }),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (res.ok && (await res.json().catch(() => ({}))).token) {
      scheme = 'token'
    }
  } catch {
    // Unreachable upstream: fall through to legacy, the call below reports
    // the real error.
  }

  schemeCache.set(upstream, scheme)
  return scheme
}

/**
 * Runs an allowlisted command on the upstream node.
 *
 * @param {string} upstream Base URL of the upstream API, e.g. http://127.0.0.1:8899
 * @param {string} command
 * @param {number} [timeoutMs]
 * @returns {Promise<{ok: boolean, stdout?: string, error?: string}>}
 */
export async function execOnUpstream(upstream, command, timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    const scheme = await detectScheme(upstream)
    const timestamp = Date.now()

    const headers = {
      'Content-Type': 'application/json',
      'X-Client-Id': UPSTREAM_CLIENT_ID,
      'X-Timestamp': String(timestamp),
    }

    if (scheme === 'token') {
      const tokenRes = await fetch(`${upstream}/api/terminal/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: UPSTREAM_CLIENT_ID }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!tokenRes.ok) {
        return { ok: false, error: `upstream token request failed: ${tokenRes.status}` }
      }
      const { token } = await tokenRes.json()
      if (!token) return { ok: false, error: 'upstream did not issue a terminal token' }
      headers['X-Terminal-Token'] = token
      headers['X-Request-Signature'] = signCommand(token, timestamp, command)
    } else {
      headers['X-Request-Signature'] = legacySignature(command, timestamp)
    }

    const res = await fetch(`${upstream}/api/terminal/exec`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ command }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: body.error || `upstream returned ${res.status}` }
    }
    return { ok: true, stdout: String(body.stdout ?? '') }
  } catch (err) {
    return { ok: false, error: `upstream unreachable: ${err.message}` }
  }
}

/**
 * Fetches a JSON GET endpoint from the upstream API.
 *
 * @param {string} upstream
 * @param {string} path e.g. /api/metrics
 * @param {number} [timeoutMs]
 */
export async function getFromUpstream(upstream, path, timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    const res = await fetch(`${upstream}${path}`, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
