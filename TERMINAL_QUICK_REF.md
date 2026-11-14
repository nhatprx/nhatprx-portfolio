#!/usr/bin/env bash
# Terminal Security - Quick Reference

## Running Tests Locally

```bash
# Terminal command allowlist tests
cd server
node --test test/terminal.test.mjs

# API security tests (rate limiting, sanitization, validation)
node --test test/api-security.test.mjs

# Run all tests
node --test test/*.test.mjs
```

## Testing Commands on EC2

### System Info
```bash
uname -a                    # Kernel & architecture
uptime                      # System uptime & load
free -h                     # Memory usage
df -h                       # Disk usage
whoami                      # Current user
```

### Deployment
```bash
git log --oneline -10       # Last 10 commits
git branch -a               # All branches
git status                  # Working tree status
```

### Health & Monitoring
```bash
health                      # API health check
health-detailed             # System info
metrics                     # Process listing
metrics-cpu                 # CPU usage
ps aux                      # All processes
```

### Logs & Services
```bash
api-log                     # API logs (last 30 lines)
systemctl-nhatprx           # Service status
nginx-status                # Nginx status
```

### System State
```bash
proc-cpuinfo                # CPU count
proc-meminfo                # Memory info
proc-loadavg                # Load average
proc-net-dev                # Network stats
ls -1 -la                   # Project files
```

## Request Format

### Request
```javascript
POST /api/terminal/exec

Headers:
  X-Request-Signature: <base64(command|timestamp)>
  X-Client-Id: <browser-fingerprint>
  X-Timestamp: <milliseconds>

Body:
  { "command": "uname -a" }
```

### Response (Success)
```javascript
{
  "ok": true,
  "stdout": "Linux ... x86_64 GNU/Linux",
  "executedAt": "2026-11-14T15:30:00Z"
}
```

### Response (Error)
```javascript
// Command not allowed
{ "error": "command not allowed: rm" }

// Rate limited
{
  "error": "Rate limit exceeded",
  "rateLimitReset": 45000  // ms until reset
}

// Other error
{
  "error": "Command execution failed",
  "details": "permission denied"
}
```

## Security Behavior

### Rate Limiting
- Limit: 60 requests per 60 seconds
- Key: `{clientIp}|{clientId}`
- Response: 429 with `rateLimitReset` milliseconds

### Output Sanitization
Automatically masks:
- AWS access keys (AKIA...)
- Secret keys (aws_secret_access_key)
- Passwords (password: ***)
- API keys (api_key: ***)
- Private IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- Output size limit: 100KB

### Command Injection Prevention
All commands use `execFile()` with fixed argv:
- No shell metacharacters allowed
- No pipe, redirection, or command chaining at OS level
- Arguments must exactly match allowlist

### Replay Prevention
- Timestamp must be within 5 minutes of server
- Request signature includes timestamp
- Prevents reusing old requests

## Troubleshooting

### Test Failure: "command not in allowlist"
- Command name must be lowercase
- Check exact spelling against allowlist
- Some commands need the exact flag (e.g., `-a` for `uname`)

### Test Failure: "permission denied"
- Running command that requires root
- Common: accessing `/var/log/nginx/error.log`
- Solution: Use commands pre-configured with proper paths

### Test Timeout
- Command took longer than 5 seconds
- Check system load
- Some commands may be slow under high load

### Rate Limited
- Too many requests from same IP+client
- Wait for reset time (shown in response)
- Rate limits are per-IP, not per-user

## Monitoring

### Check Request Volume
```bash
# Watch for rate-limited clients (from server logs)
grep "RATE_LIMITED" /var/log/portfolio-api.log

# Watch for injection attempts
grep "argument not allowed" /var/log/portfolio-api.log
```

### Common Error Patterns
```
not_allowed       - Command not in allowlist (normal)
permission_denied - Access denied by OS (check permissions)
not_found         - Binary or file not found (check paths)
timeout           - Command exceeded 5s (system overload?)
error             - Unexpected error (check logs)
```

## Deployment

### Required Environment Variables
```bash
TERMINAL_HMAC_SECRET=<32-byte-hex>      # Keep secret
PASSKEY_HASH_FILE=/var/lib/nhatprx-api/passkey.hash
TOKEN_SECRET_FILE=/var/lib/nhatprx-api/token.secret
PORT=8787
AWS_REGION=ap-southeast-1
```

### Generate HMAC Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Systemd Service
```ini
[Service]
Environment="TERMINAL_HMAC_SECRET=YOUR_SECRET"
ExecStart=/usr/bin/node /path/to/index.mjs
Restart=on-failure
StandardOutput=journal
StandardError=journal
```

## Files Changed

- `src/services/terminalApi.ts` - Improved sanitization
- `src/components/terminal/terminalEvaluator.ts` - No changes
- `server/terminal.mjs` - Expanded allowlist (15 → 25+ commands)
- `server/index.mjs` - Added security middleware
- `server/test/terminal.test.mjs` - 18 tests (NEW)
- `server/test/api-security.test.mjs` - 17 tests (NEW)
- `TERMINAL_SECURITY.md` - Full documentation (NEW)
- `TERMINAL_FIXES.md` - Summary of changes (NEW)

---

**All tests passing** ✅
**Ready for production** ✅
