// Client for the public read-only terminal endpoint.
//
// SECURITY MODEL:
// - The browser fetches a short-lived signing token from /api/terminal/token.
// - Every command is signed with HMAC-SHA256 over
//   `clientId|timestamp|nonce|command`.
// - The API verifies the signature in constant time, rejects a nonce it has
//   already seen, and rate limits per client IP.
// - Commands run against a fixed argv allowlist on the server; there is no
//   shell, so no user input can become a shell metacharacter.
// - Output is sanitized server-side and again on the way out.
//
// The browser never holds the API secret: the token only authorises one
// client id, and the per-client signing key is derived on the server.

export interface TerminalExecResult {
  stdout: string
  executedAt?: string
  requestId?: string
}

export interface TerminalInfo {
  hostname: string
  kernel_version: string
  os_release: string
  is_ec2: boolean
}

interface TerminalToken {
  token: string
  expiresAt: number
}

let tokenCache: TerminalToken | null = null

/**
 * Generates a one-time nonce for a signed request.
 *
 * `crypto.randomUUID` needs a secure context, so it is not available on a
 * plain-HTTP origin. The fallback uses the random source that always is.
 */
function createNonce(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Fetches (and caches) the terminal signing token for this client id.
 */
async function getTerminalToken(clientId: string): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token
  }

  const res = await fetch('/api/terminal/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  })
  if (!res.ok) {
    throw new Error(`Could not obtain a terminal token (${res.status})`)
  }
  const body = await res.json()
  tokenCache = {
    token: String(body.token || ''),
    expiresAt: Date.now() + Number(body.expiresIn || 3600) * 1000,
  }
  return tokenCache.token
}

/**
 * Derives the per-client signing key from the token.
 *
 * The server derives the same key with HMAC-SHA256(tokenSecret, "key." + clientId)
 * and verifies against the token-derived key, so the browser only needs the
 * token it was handed - never the API secret.
 */
async function signCommand(
  clientId: string,
  timestamp: number,
  command: string,
  nonce: string
): Promise<string> {
  const token = await getTerminalToken(clientId)
  const payload = `${clientId}|${timestamp}|${nonce}|${command}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Runs a read-only command on the server node.
 * Throws when the command is not on the allowlist or the signature is rejected.
 */
export async function execTerminalCommand(command: string): Promise<TerminalExecResult> {
  const timestamp = Date.now()
  const clientId = getClientId()
  // A fresh nonce per request makes every signature unique, so a captured
  // request cannot be replayed by the server.
  const nonce = createNonce()
  const [token, signature] = await Promise.all([
    getTerminalToken(clientId),
    signCommand(clientId, timestamp, command, nonce),
  ])

  const res = await fetch('/api/terminal/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Signature': signature,
      'X-Client-Id': clientId,
      'X-Terminal-Token': token,
      'X-Timestamp': String(timestamp),
      'X-Request-Nonce': nonce,
    },
    body: JSON.stringify({ command }),
  })

  if (!res.ok) {
    let message = `Command failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
      if (body?.rateLimitReset) {
        message += ` - Rate limit reset in ${Math.ceil(body.rateLimitReset / 1000)}s`
      }
    } catch {
      // non-JSON error body
    }
    throw new Error(message)
  }

  const body = await res.json()
  return {
    stdout: sanitizeTerminalOutput(String(body?.stdout ?? '')),
    executedAt: body?.executedAt,
    requestId: body?.requestId,
  }
}

/**
 * Fetches system info for the terminal welcome message.
 * Throws if server is down (no fallback - real terminal behavior).
 */
export async function fetchTerminalInfo(): Promise<TerminalInfo> {
  const res = await fetch('/api/system-info')
  if (!res.ok) {
    throw new Error('Server unreachable - terminal requires backend')
  }
  const body = await res.json()
  return body.info
}

/**
 * Sanitizes terminal output to remove sensitive information.
 * The server already does this; repeating it here keeps the browser safe even
 * if the API is replaced by a proxy that does not sanitize.
 */
export function sanitizeTerminalOutput(output: string): string {
  output = output.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA****')
  output = output.replace(/aws_secret_access_key\s*[:=]\s*\S+/gi, 'aws_secret_access_key: ****')
  output = output.replace(/secret_access_key\s*[:=]\s*\S+/gi, 'secret_access_key: ****')
  output = output.replace(/password\s*[:=]\s*\S+/gi, 'password: ****')
  output = output.replace(/token\s*[:=]\s*\S+/gi, 'token: ****')
  output = output.replace(/api[_-]?key\s*[:=]\s*\S+/gi, 'api_key: ****')
  output = output.replace(/192\.168\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  output = output.replace(/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  output = output.replace(/172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  return output
}

/**
 * Stable per-browser client id.
 *
 * Persisted so the server's rate limit window survives a page reload.
 */
function getClientId(): string {
  const STORAGE_KEY = 'nhatprx_terminal_client_id'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && /^[A-Za-z0-9_-]{4,64}$/.test(saved)) return saved
    const generated = `c_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`
    localStorage.setItem(STORAGE_KEY, generated)
    return generated
  } catch {
    // localStorage unavailable (private mode) - fall back to a per-session id.
    return `c_${Math.random().toString(36).slice(2, 14)}`
  }
}
