# Terminal Security Implementation

## Overview

The EC2 terminal on the portfolio homepage provides read-only access to server information. This document explains the security layers that protect this functionality.

## Architecture

```
Frontend (terminalEvaluator.ts)
    ↓
    ├─ Local commands (REMOTE_COMMANDS allowlist)
    │  (resolved client-side only)
    │
    └─ Remote EC2 commands → API endpoint (/api/terminal/exec)
                               ↓
                    Backend Security Middleware:
                    1. Validate request headers
                    2. Rate limiting (60 req/min)
                    3. Check allowlist
                    4. Execute with execFile (no shell)
                    5. Sanitize output
```

## Frontend Security

### File: `src/components/terminal/terminalEvaluator.ts`

- **Allowlist**: `REMOTE_COMMANDS` maps user input to exact backend commands
- **No execution**: Frontend never executes commands - only validates syntax and routes to backend
- **Chaining support**: `&&` (fail-fast) and `;` (always continue) operators
- **Validation**: `isFullyRemote()` ensures all commands in a chain are in the allowlist

### File: `src/services/terminalApi.ts`

- **Request signing**: Includes timestamp and signature headers
- **Output sanitization**: Client-side masking of sensitive data (fallback layer)
- **Error handling**: Rate limit messages include reset time

## Backend Security

### File: `server/terminal.mjs`

**The Core Allowlist**

Each command has:
- `args`: Exact array of allowed arguments (empty = no args)
- `exec`: Exact argv array passed to `execFile` (no shell parsing)

Example:
```javascript
'git': {
  args: ['log', '--oneline', '-10'],
  exec: ['git', '-C', '/home/ubuntu/nhatprx-api', 'log', '--oneline', '-10'],
}
```

**Execution Model**

- **No shell**: Uses Node's `execFile()` with `shell: false`
- **Fixed argv**: Command arguments are never interpolated into a shell string
- **Timeout**: 5 second execution timeout
- **Output limit**: 100KB max output

**Error Handling**

Returns classified errors:
- `not_allowed` - Command not in allowlist
- `permission_denied` - Insufficient permissions (exit code 1)
- `not_found` - Binary or file not found (exit code 127)
- `timeout` - Command exceeded 5 second limit
- `error` - Other execution errors

### File: `server/index.mjs`

**Security Middleware**

1. **Header Validation**
   - `X-Request-Signature`: Request integrity proof
   - `X-Client-Id`: Browser fingerprint for rate limiting
   - `X-Timestamp`: Must be within 5 minutes (prevents replay)

2. **Rate Limiting**
   - Key: `{clientIp}|{clientId}`
   - Limit: 60 requests per 60 seconds
   - Response: 429 with `rateLimitReset` time

3. **Output Sanitization**
   
   Masks sensitive patterns:
   - AWS access keys: `AKIA[0-9A-Z]{16}` → `AKIA****`
   - AWS secret keys: `aws_secret_access_key: ***` → masked
   - Passwords: `password: ***` → masked
   - API keys: `api_key: ***` → masked
   - Private IPs: `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x` → `x.x.x.x`
   - Output size: Truncated at 100KB

## Command Allowlist

### System Information
- `uname -a` - Kernel & architecture
- `uptime` - System uptime
- `free -h` - Memory usage
- `df -h` - Disk usage
- `whoami` - Current user
- `hostname` - Instance hostname
- `id` - User ID info
- `nproc` - CPU count

### Git Deployment History
- `git log --oneline -10` - Last 10 commits
- `git branch -a` - All branches
- `git status` - Working tree status

### Health & Metrics
- `health` - API health check endpoint
- `health-detailed` - Detailed system info
- `metrics` - Process listing
- `metrics-cpu` - CPU top output

### Services & Logs
- `ps aux` - All processes
- `api-log` - Last 30 lines of API logs
- `systemctl-nhatprx` - Service status
- `nginx-status` - Nginx status

### System State
- `proc-cpuinfo` - CPU info
- `proc-meminfo` - Memory info
- `proc-loadavg` - Load average
- `proc-net-dev` - Network statistics

### File Listing
- `ls -1 -la` - Project directory listing (restricted to `/home/ubuntu/nhatprx-api`)

## Security Decisions

### Why No Shell?

Using `execFile` with fixed argv prevents:
- Command injection via shell metacharacters
- Environment variable substitution
- Path traversal via `..` sequences
- Arbitrary argument passing

### Why Strict Allowlisting?

- Prevents misuse of available commands (e.g., piping to `dd` or `rm`)
- Makes audit review simple - all possible outputs are pre-authorized
- Catches typos and mistakes immediately

### Why Sanitize Output?

- Prevents accidental credential leakage in monitoring commands
- Protects if a service mistakenly outputs secrets
- Layered defense: backend sanitizes even if application doesn't

### Why Rate Limit?

- Prevents resource exhaustion from brute force or scripts
- Protects against DoS from bad clients
- Window resets per IP + client ID (browser fingerprint)

## Testing

### Terminal Command Tests
```bash
cd server
node --test test/terminal.test.mjs
```

Tests cover:
- Command resolution and allowlist validation
- Argument validation (exact match only)
- Execution of real system commands
- Error classification
- Security: no dangerous commands in allowlist
- Security: no command injection

### API Security Tests
```bash
node --test test/api-security.test.mjs
```

Tests cover:
- Rate limiting (allows/blocks/resets correctly)
- Output sanitization (AWS keys, passwords, IPs, size)
- Request validation (headers, timestamps)

## Deployment Checklist

### Environment Variables
```bash
# Generated once, shared across server restarts
export TERMINAL_HMAC_SECRET="$(openssl rand -hex 32)"
export PASSKEY_HASH_FILE="/var/lib/nhatprx-api/passkey.hash"
export TOKEN_SECRET_FILE="/var/lib/nhatprx-api/token.secret"
```

### Systemd Service
```ini
[Service]
Environment="TERMINAL_HMAC_SECRET=YOUR_SECRET"
Environment="PORT=8787"
Environment="AWS_REGION=ap-southeast-1"
ExecStart=/usr/bin/node /home/ubuntu/nhatprx-api/index.mjs
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
```

### Monitoring
- Check logs for rate-limited clients: `RATE_LIMITED` errors
- Monitor for injection attempts: `argument not allowed` errors
- Alert on frequent timeouts: may indicate system overload

## Attack Surface

**Mitigated:**
- ✓ Command injection (fixed argv, no shell)
- ✓ Path traversal (allowlist + fixed paths)
- ✓ DoS from unlimited requests (rate limiting)
- ✓ Replay attacks (timestamp validation)
- ✓ Credential leakage (output sanitization)

**Accepted Risks:**
- Trusting the allowlist (operator responsibility)
- Commands that hang (5 second timeout)
- Commands on disk that change (Ubuntu package updates)
- Side-channel attacks via timing (acceptable for read-only)

## Future Improvements

1. **Per-command rate limits**: Different limits for heavy operations
2. **Audit log persistence**: Store in database instead of memory
3. **Two-factor auth**: For sensitive commands
4. **Encrypted transport**: TLS for sensitive data
5. **Command output diffs**: Detect anomalies via ML

---

**Last Updated**: November 14, 2026
**Security Level**: Read-only guest terminal (no state changes allowed)
