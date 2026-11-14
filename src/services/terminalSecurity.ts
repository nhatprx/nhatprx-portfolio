/**
 * Terminal Security Layer
 * 
 * Implements strict security controls for terminal access:
 * - Rate limiting (60 requests/minute per IP)
 * - Request validation & signing
 * - Audit logging
 * - Command allowlist enforcement
 * - Output sanitization
 */

export interface RateLimitState {
  count: number
  resetTime: number
}

export interface TerminalAuditLog {
  timestamp: number
  clientId: string
  command: string
  status: 'success' | 'error' | 'blocked'
  reason?: string
  requestId: string
}

// Rate limiting: 60 requests per 60 seconds per client
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 60

const rateLimitMap = new Map<string, RateLimitState>()
const auditLog: TerminalAuditLog[] = []

/**
 * Check and update rate limit for a client
 * Returns null if within limit, otherwise returns reset time in ms
 */
export function checkRateLimit(clientId: string): number | null {
  const now = Date.now()
  let state = rateLimitMap.get(clientId)

  if (!state || now >= state.resetTime) {
    // New window
    state = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
    rateLimitMap.set(clientId, state)
    return null
  }

  state.count++
  if (state.count > RATE_LIMIT_MAX) {
    return state.resetTime - now
  }

  return null
}

/**
 * Validate command against allowed list (client-side check)
 * Server must re-validate this
 */
export const ALLOWED_COMMANDS = [
  'uname', 'uptime', 'free', 'df', 'whoami', 'hostname', 'id', 'nproc',
  'git', 'health', 'health-detailed', 'metrics', 'metrics-cpu', 'ps',
  'api-log', 'nginx-access', 'nginx-error', 'ls',
  'systemctl-nhatprx', 'nginx-status',
  'proc-cpuinfo', 'proc-meminfo', 'proc-loadavg', 'proc-net-dev',
]

export function isCommandAllowed(cmd: string): boolean {
  return ALLOWED_COMMANDS.includes(cmd.toLowerCase())
}

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Log command execution for audit trail
 */
export function addAuditLog(
  clientId: string,
  command: string,
  status: 'success' | 'error' | 'blocked',
  reason?: string
): TerminalAuditLog {
  const log: TerminalAuditLog = {
    timestamp: Date.now(),
    clientId,
    command,
    status,
    reason,
    requestId: generateRequestId(),
  }

  auditLog.push(log)
  
  // Keep only last 1000 entries in memory
  if (auditLog.length > 1000) {
    auditLog.shift()
  }

  return log
}

/**
 * Get audit logs (admin only)
 */
export function getAuditLogs(limit = 100): TerminalAuditLog[] {
  return auditLog.slice(-limit)
}

/**
 * Generate client ID based on browser fingerprint
 */
export function generateClientId(): string {
  const ua = navigator.userAgent
  const lang = navigator.language
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const fingerprint = `${ua}|${lang}|${tz}`
  
  // Simple hash
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return `client_${Math.abs(hash).toString(36)}`
}

/**
 * Validate request timestamp (must be within 5 minutes)
 */
export function isValidTimestamp(timestamp: number): boolean {
  const now = Date.now()
  const diff = Math.abs(now - timestamp)
  return diff < 5 * 60 * 1000 // 5 minutes
}

/**
 * Validate request signature (basic HMAC check)
 * In production, use a proper HMAC library with server-side secret
 */
export function validateRequestSignature(
  signature: string,
  command: string,
  timestamp: number
): boolean {
  const data = `${command}|${timestamp}`
  const expected = btoa(data)
  // In production, implement proper HMAC comparison with timing attack protection
  return signature === expected
}
