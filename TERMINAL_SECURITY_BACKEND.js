/**
 * DEPLOYMENT GUIDE - Backend Terminal Security Middleware
 * 
 * This file should be deployed on your EC2 backend server.
 * It is NOT compiled with the frontend build.
 * 
 * ============ INSTALLATION ============
 * 1. Copy this file to: backend/middleware/terminalSecurity.js
 * 2. Install dependencies: npm install express body-parser
 * 3. Add to your Express app:
 * 
 * const terminalSecurity = require('./middleware/terminalSecurity');
 * const hmacSecret = process.env.TERMINAL_HMAC_SECRET || 'dev-secret';
 * 
 * app.post('/api/terminal/exec',
 *   terminalSecurity.middleware(hmacSecret),
 *   terminalSecurity.execTerminal
 * );
 * 
 * app.get('/api/audit-logs',
 *   authenticate, // Add your auth middleware
 *   terminalSecurity.getAuditLogs
 * );
 * 
 * ============ ENVIRONMENT VARIABLES ============
 * TERMINAL_HMAC_SECRET=your-secret-key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
 * 
 * ============ SECURITY FEATURES ============
 * ✓ Rate limiting: 60 requests/minute per IP+clientId
 * ✓ Command allowlist enforcement
 * ✓ HMAC signature validation
 * ✓ Timestamp validation (5-minute window)
 * ✓ Output sanitization (masks passwords, keys, IPs)
 * ✓ Request timeout: 30 seconds
 * ✓ Output size limit: 100KB
 * ✓ Audit logging: all commands logged to memory + stdout
 * 
 * ============ BACKEND CODE (Node.js/Express) ============
 */

const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
  'psql --version',
  'redis-cli --version',
  'systemctl -l --no-pager status portfolio-api nginx',
  'ls -1 -la /var/www/dist',
]);

// Configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 60;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_OUTPUT_SIZE = 100000; // 100KB

// State
const rateLimitMap = new Map();
const auditLog = [];

/**
 * Check rate limit for client IP + clientId combination
 */
function checkRateLimit(key, limit = RATE_LIMIT_MAX) {
  const now = Date.now();
  let state = rateLimitMap.get(key);

  if (!state || now >= state.resetTime) {
    state = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(key, state);
    return { allowed: true, resetIn: 0 };
  }

  state.count++;
  if (state.count > limit) {
    return { allowed: false, resetIn: state.resetTime - now };
  }

  return { allowed: true, resetIn: 0 };
}

/**
 * Validate request signature with HMAC
 */
function validateSignature(signature, command, timestamp, hmacSecret) {
  // Verify timestamp is recent (within 5 minutes)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return false;
  }

  // Compute expected signature with HMAC
  const data = `${command}|${timestamp}`;
  const expected = crypto
    .createHmac('sha256', hmacSecret)
    .update(data)
    .digest('base64');

  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

/**
 * Sanitize terminal output
 */
function sanitizeOutput(output) {
  // Mask AWS keys
  output = output.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA****');
  output = output.replace(/aws_secret_access_key[^:]*:[^\s]*/gi, 'aws_secret_access_key:****');

  // Mask credentials
  output = output.replace(/password[^:]*:[^\s]*/gi, 'password:****');
  output = output.replace(/token[^:]*:[^\s]*/gi, 'token:****');
  output = output.replace(/secret[^:]*:[^\s]*/gi, 'secret:****');
  output = output.replace(/api[_-]?key[^:]*:[^\s]*/gi, 'api_key:****');

  // Mask private IPs
  output = output.replace(/192\.168\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x');
  output = output.replace(/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x');
  output = output.replace(/172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x');

  // Limit output size
  if (output.length > MAX_OUTPUT_SIZE) {
    output = output.substring(0, MAX_OUTPUT_SIZE) + '\n... (output truncated)';
  }

  return output;
}

/**
 * Log command execution for audit trail
 */
function addAuditLog(clientId, clientIp, command, status, reason) {
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  auditLog.push({
    timestamp,
    clientId,
    clientIp,
    command,
    status,
    reason,
    requestId,
  });

  // Keep only last 10000 entries
  if (auditLog.length > 10000) {
    auditLog.shift();
  }

  console.log(`[TERMINAL_AUDIT] ${timestamp} | ${status.toUpperCase()} | ${clientId} (${clientIp}) | ${command.substring(0, 50)}${reason ? ' (' + reason + ')' : ''}`);

  return requestId;
}

/**
 * Terminal Security Middleware
 */
function terminalSecurityMiddleware(hmacSecret) {
  return (req, res, next) => {
    // Extract security headers
    const signature = req.headers['x-request-signature'];
    const clientId = req.headers['x-client-id'];
    const timestamp = parseInt(req.headers['x-timestamp'], 10);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Parse request body
    const { command } = req.body;

    // Validation 1: Required headers
    if (!signature || !clientId || !timestamp || !command) {
      return res.status(400).json({
        error: 'Missing required security headers',
        code: 'INVALID_REQUEST',
      });
    }

    // Validation 2: Command must be in allowlist
    if (!ALLOWED_COMMANDS.has(command)) {
      addAuditLog(clientId, clientIp, command, 'blocked', 'Command not in allowlist');
      return res.status(403).json({
        error: 'Command not permitted',
        code: 'FORBIDDEN_COMMAND',
      });
    }

    // Validation 3: Rate limiting
    const rateLimitKey = `${clientIp}|${clientId}`;
    const { allowed, resetIn } = checkRateLimit(rateLimitKey);
    if (!allowed) {
      addAuditLog(clientId, clientIp, command, 'rate-limited', `Reset in ${resetIn}ms`);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        rateLimitReset: resetIn,
      });
    }

    // Validation 4: Signature verification
    if (!validateSignature(signature, command, timestamp, hmacSecret)) {
      addAuditLog(clientId, clientIp, command, 'blocked', 'Invalid signature');
      return res.status(401).json({
        error: 'Invalid request signature',
        code: 'SIGNATURE_INVALID',
      });
    }

    // Validation passed - attach to request
    req.terminalCommand = command;
    req.terminalClientId = clientId;
    req.terminalClientIp = clientIp;
    req.addAuditLog = addAuditLog;
    req.sanitizeOutput = sanitizeOutput;

    next();
  };
}

/**
 * Terminal exec endpoint
 * POST /api/terminal/exec
 */
async function execTerminal(req, res) {
  const command = req.terminalCommand;
  const clientId = req.terminalClientId;
  const clientIp = req.terminalClientIp;
  const addAuditLog = req.addAuditLog;
  const sanitizeOutput = req.sanitizeOutput;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Command timeout')), REQUEST_TIMEOUT)
    );

    const { stdout, stderr } = await Promise.race([
      execAsync(command, { maxBuffer: 1024 * 1024 }),
      timeoutPromise,
    ]);

    const output = sanitizeOutput(stdout || stderr || '(no output)');
    const requestId = addAuditLog(clientId, clientIp, command, 'success');

    res.json({
      stdout: output,
      executedAt: new Date().toISOString(),
      requestId,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const requestId = addAuditLog(clientId, clientIp, command, 'error', errorMsg);

    res.status(500).json({
      error: 'Command execution failed',
      code: 'EXEC_ERROR',
      details: errorMsg,
      requestId,
    });
  }
}

/**
 * Get audit logs (admin endpoint)
 * GET /api/audit-logs?limit=100
 * Requires authentication
 */
function getAuditLogs(req, res) {
  const limit = parseInt(req.query.limit, 10) || 100;
  res.json({
    logs: auditLog.slice(-limit),
    total: auditLog.length,
  });
}

module.exports = {
  middleware: terminalSecurityMiddleware,
  execTerminal,
  getAuditLogs,
  addAuditLog,
  sanitizeOutput,
  validateSignature,
  checkRateLimit,
  ALLOWED_COMMANDS,
};
