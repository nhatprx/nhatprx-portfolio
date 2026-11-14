/**
 * Backend Terminal Security Middleware
 * 
 * Deploy this on your EC2 node (backend API).
 * Handles: rate limiting, command validation, audit logging, output sanitization
 * 
 * Usage in Express app:
 * app.use('/api/terminal', terminalSecurityMiddleware)
 * app.post('/api/terminal/exec', execTerminal)
 */

import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

// Allowed commands on server (matches client allowlist)
const ALLOWED_COMMANDS = new Set([
  'uname -a',
  'uptime',
  'free -h',
  'df -h',
  'whoami',
  'hostname',
  'git log --oneline -10',
  'git branch -a',
  'git status',
  'cat /var/www/.git/HEAD',
  'curl -s http://localhost:8080/health',
  'curl -s http://localhost:8080/health/detailed',
  'ps aux | grep portfolio | grep -v grep',
  'top -b -n 1 | head -15',
  'free -h && sync; echo 3 > /proc/sys/vm/drop_caches',
  'tail -n 30 /var/log/portfolio-api.log',
  'tail -n 30 /var/log/nginx/access.log',
  'tail -n 30 /var/log/nginx/error.log',
  'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
  'docker logs portfolio-api --tail 20',
  'docker inspect portfolio-api | grep -E "IPAddress|Status|ExposedPorts"',
  'cat /var/www/VERSION || echo "unknown"',
  'stat -c "%y" /var/www/dist/index.html',
  'grep -E "^NODE_ENV|^AWS_REGION|^PORT" /etc/environment',
  'netstat -tulpn | grep -E "LISTEN|nginx|portfolio"',
  'curl -s http://localhost:8080/nginx_status',
  'lsof -i -P -n | grep -E "LISTEN|portfolio|nginx"',
  'psql -c "SELECT version();" 2>/dev/null || echo "PostgreSQL unavailable"',
  'redis-cli INFO stats | head -10',
  'systemctl -l --no-pager status portfolio-api nginx',
  'ls -1 -la /var/www/dist',
])

interface RateLimitState {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitState>()
const auditLog: any[] = []

// Configuration
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 60
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_OUTPUT_SIZE = 100000 // 100KB

/**
 * Check rate limit for client IP + clientId combination
 */
function checkRateLimit(key: string, limit: number = RATE_LIMIT_MAX): { allowed: boolean; resetIn: number } {
  const now = Date.now()
  let state = rateLimitMap.get(key)

  if (!state || now >= state.resetTime) {
    state = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
    rateLimitMap.set(key, state)
    return { allowed: true, resetIn: 0 }
  }

  state.count++
  if (state.count > limit) {
    return { allowed: false, resetIn: state.resetTime - now }
  }

  return { allowed: true, resetIn: 0 }
}

/**
 * Validate request signature
 */
function validateSignature(
  signature: string,
  command: string,
  timestamp: number,
  hmacSecret: string
): boolean {
  // Verify timestamp is recent (within 5 minutes)
  const now = Date.now()
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return false
  }

  // Compute expected signature with HMAC
  const data = `${command}|${timestamp}`
  const expected = crypto
    .createHmac('sha256', hmacSecret)
    .update(data)
    .digest('base64')

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

/**
 * Sanitize terminal output
 */
function sanitizeOutput(output: string): string {
  // Mask AWS keys
  output = output.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA****')
  output = output.replace(/aws_secret_access_key[^:]*:[^\s]*/gi, 'aws_secret_access_key:****')
  
  // Mask credentials
  output = output.replace(/password[^:]*:[^\s]*/gi, 'password:****')
  output = output.replace(/token[^:]*:[^\s]*/gi, 'token:****')
  output = output.replace(/secret[^:]*:[^\s]*/gi, 'secret:****')
  output = output.replace(/api[_-]?key[^:]*:[^\s]*/gi, 'api_key:****')
  
  // Mask private IPs
  output = output.replace(/192\.168\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  output = output.replace(/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  output = output.replace(/172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
  
  // Limit output size
  if (output.length > MAX_OUTPUT_SIZE) {
    output = output.substring(0, MAX_OUTPUT_SIZE) + '\n... (output truncated)'
  }

  return output
}

/**
 * Log command execution for audit trail
 */
function addAuditLog(
  clientId: string,
  clientIp: string,
  command: string,
  status: 'success' | 'error' | 'blocked' | 'rate-limited',
  reason?: string
): void {
  auditLog.push({
    timestamp: new Date().toISOString(),
    clientId,
    clientIp,
    command,
    status,
    reason,
  })

  // Keep only last 10000 entries
  if (auditLog.length > 10000) {
    auditLog.shift()
  }

  // In production, persist to database
  console.log(`[TERMINAL_AUDIT] ${status} | ${clientId} (${clientIp}) | ${command.substring(0, 50)}`)
}

/**
 * Terminal Security Middleware
 */
export function terminalSecurityMiddleware(hmacSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract security headers
    const signature = req.headers['x-request-signature'] as string
    const clientId = req.headers['x-client-id'] as string
    const timestamp = parseInt(req.headers['x-timestamp'] as string, 10)
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown'

    // Parse request body
    const { command } = req.body as { command: string }

    // Validation 1: Required headers
    if (!signature || !clientId || !timestamp || !command) {
      res.status(400).json({
        error: 'Missing required security headers',
        code: 'INVALID_REQUEST',
      })
      return
    }

    // Validation 2: Command must be in allowlist
    if (!ALLOWED_COMMANDS.has(command)) {
      addAuditLog(clientId, clientIp, command, 'blocked', 'Command not in allowlist')
      res.status(403).json({
        error: 'Command not permitted',
        code: 'FORBIDDEN_COMMAND',
      })
      return
    }

    // Validation 3: Rate limiting
    const rateLimitKey = `${clientIp}|${clientId}`
    const { allowed, resetIn } = checkRateLimit(rateLimitKey)
    if (!allowed) {
      addAuditLog(clientId, clientIp, command, 'rate-limited', `Reset in ${resetIn}ms`)
      res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        rateLimitReset: resetIn,
      })
      return
    }

    // Validation 4: Signature verification
    if (!validateSignature(signature, command, timestamp, hmacSecret)) {
      addAuditLog(clientId, clientIp, command, 'blocked', 'Invalid signature')
      res.status(401).json({
        error: 'Invalid request signature',
        code: 'SIGNATURE_INVALID',
      })
      return
    }

    // Validation passed - attach to request
    ;(req as any).terminalCommand = command
    ;(req as any).terminalClientId = clientId
    ;(req as any).terminalClientIp = clientIp
    ;(req as any).terminalRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    ;(req as any).sanitizeOutput = sanitizeOutput
    ;(req as any).addAuditLog = addAuditLog

    next()
  }
}

/**
 * Example terminal exec endpoint
 * 
 * POST /api/terminal/exec
 * Headers:
 *   X-Request-Signature: HMAC signature
 *   X-Client-Id: browser fingerprint
 *   X-Timestamp: request timestamp
 * Body:
 *   { command: "git log --oneline -10" }
 */
export async function execTerminal(req: Request, res: Response) {
  const terminalCommand = (req as any).terminalCommand
  const clientId = (req as any).terminalClientId
  const clientIp = (req as any).terminalClientIp
  const requestId = (req as any).terminalRequestId
  const sanitizeOutput = (req as any).sanitizeOutput
  const addAuditLog = (req as any).addAuditLog

  try {
    // Execute command with timeout
    const { exec } = await import('child_process')
    const util = await import('util')
    const execPromise = util.promisify(exec)

    const { stdout, stderr } = await Promise.race([
      execPromise(terminalCommand, { maxBuffer: 1024 * 1024 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Command timeout')), REQUEST_TIMEOUT)
      ),
    ]) as { stdout: string; stderr: string }

    const output = sanitizeOutput(stdout || stderr || '(no output)')
    addAuditLog(clientId, clientIp, terminalCommand, 'success')

    res.json({
      stdout: output,
      executedAt: new Date().toISOString(),
      requestId,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    addAuditLog(clientId, clientIp, terminalCommand, 'error', errorMsg)

    res.status(500).json({
      error: 'Command execution failed',
      code: 'EXEC_ERROR',
      requestId,
    })
  }
}

/**
 * Get audit logs (admin endpoint)
 * Should be protected with JWT authentication
 */
export function getAuditLogs(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string, 10) || 100
  res.json({
    logs: auditLog.slice(-limit),
    total: auditLog.length,
  })
}

export function exportAuditLogs() {
  return auditLog
}
