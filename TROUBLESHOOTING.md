# nhatprx-portfolio - Issues Fixed & Enhancements

## 🔴 Issue 1: Terminal - Multiple Commands Not Executed

### Problem
When entering `whoami hostname uptime free -h df -h`, only `whoami` was executed. Other commands were silently ignored.

**Root Cause**: The terminal parser treated space-separated commands as a single command because they weren't chained with `&&` or `;`.

### Solution
Added validation in `terminalEvaluator.ts` to:
1. Detect when user types multiple commands separated by spaces (not chained)
2. Show helpful error message suggesting correct syntax:
   ```
   bash: hostname: command not found.
   
   Did you mean to chain multiple commands? Try:
     whoami && hostname && uptime   (stop on first error)
     whoami ; hostname ; uptime      (always continue)
   ```

### Testing
Added comprehensive test in `server/test/terminal.test.mjs`:
- ✓ Single commands: `whoami`, `hostname`, `uptime`, `free -h`, `df -h`
- ✓ Chained commands with `&&`: `whoami && hostname && uptime`
- ✓ Chained commands with `;`: `free -h ; df -h ; uptime`
- ✓ Disallowed commands are rejected

**Run locally**: `npm run check` (from server/)
**Run on EC2**: `bash server/test-terminal-live.sh https://nhatprx.com`

### Verification
Terminal now supports:
```bash
# Single commands (always work)
whoami
hostname
uptime
free -h
df -h
uname -a

# Chained commands (execute all)
whoami && hostname && uptime
free -h && df -h && uptime
free -h ; df -h ; uptime

# Error handling
whoami && cat /etc/shadow  # Stops at cat (not allowed)
whoami ; cat /etc/shadow   ; uptime  # Continues after cat error
```

---

## 🟠 Issue 2: Admin Content Not Persisted to S3

### Problem
Editing content in admin dashboard worked locally but wasn't saved to S3. Next visit from different device showed old content.

**Root Cause**: 
1. `saveRemoteTranslations()` wasn't properly awaited and error wasn't handled
2. No feedback to user about sync status
3. No way to debug if save failed silently

### Solution
Updated `AdminPortal.tsx` to:
1. **Proper async/await**: Auto-save now awaits `saveRemoteTranslations()` and tracks sync status
2. **Sync status indicator**: Shows "⟳ Saving…", "✓ Synced", or "✗ Sync failed" in header
3. **Error handling**: Toast notifications inform user if sync failed
4. **Manual sync on close**: `handleCloseAndSync` now waits for remote save before closing

### Changes
```typescript
// Before (silent failure)
void saveRemoteTranslations(updatedToSave)

// After (proper tracking)
setSyncStatus('saving')
const success = await saveRemoteTranslations(updatedToSave)
setSyncStatus(success ? 'saved' : 'error')
if (!success) {
  showToast('Failed to sync to cloud (saved locally)', 'error')
}
```

### Flow
1. User edits content → localStorage saves immediately
2. 350ms debounce → remote save begins (if authenticated)
3. Header shows "⟳ Saving…" (amber)
4. On success: "✓ Synced" (green) for 1.5s
5. On failure: "✗ Sync failed" (red) + toast message

### Debugging
Check browser console for:
- `Failed to save translations to remote storage: [error]`
- Network tab for `/api/content` PUT requests
- Make sure you're authenticated (token in sessionStorage)

---

## 🟡 Issue 3: AWS Setup - Budget & Bedrock Incomplete

### Problem
AWS services (Budget monitoring and Bedrock translation) weren't fully configured with clear setup process.

### Solution

#### 3a. Budget Monitoring
Created interactive setup script: `bash server/setup-budget-interactive.sh`

What it does:
- Prompts for alert email and monthly budget limit
- Creates SNS topic for email notifications
- Sets up AWS Budget with 80% threshold alert
- Tracks EC2, S3, and Bedrock spending

```bash
# Setup with defaults
bash server/setup-budget-interactive.sh

# Or set environment variables
ALERT_EMAIL="you@example.com" bash server/setup-budget.sh 11.67
```

Monitors:
- EC2 instance costs
- S3 storage and data transfer
- Bedrock API usage

#### 3b. Bedrock Translation
Already working but permissions need to be set on EC2:

```bash
# On EC2 instance
bash server/setup-bedrock-iam.sh <instance-profile-name>
```

This adds permissions to invoke:
- `anthropic.claude-3-5-haiku-20241022-v1:0` (used for translation)

#### 3c. Complete AWS Setup
New comprehensive script: `bash server/setup-aws-all.sh`

Runs all steps:
1. ✓ S3 CORS configuration (resume uploads)
2. ✓ Bedrock IAM permissions
3. ✓ Budget monitoring setup

---

## 📊 How to Verify Everything Works

### 1. Test Terminal on Local Dev
```bash
cd server
npm run check  # All tests pass
```

### 2. Test Terminal on Live EC2
```bash
bash server/test-terminal-live.sh https://nhatprx.com

# Or with local dev server
bash server/test-terminal-live.sh http://localhost:8787
```

Expected output:
```
Testing: whoami
✓ Success
ubuntu

Testing: hostname
✓ Success
nhatprx-server

Testing: uptime
✓ Success
 12:34:56 up 45 days, 23:42, 1 user, load average: 0.12, 0.15, 0.18
```

### 3. Test Admin Content Save
1. Go to admin dashboard (#admin)
2. Login with passkey
3. Edit any section (e.g., About)
4. Watch header for "⟳ Saving…" then "✓ Synced"
5. Open dev tools → Network tab → check `/api/content` PUT request
6. Open different browser/device → verify changes persisted

### 4. Test Bedrock Translation
1. Admin dashboard → select language (e.g., English)
2. Click "Auto Translate" button
3. Select target languages (Vietnamese, French, Japanese)
4. Wait for translation (~5-10s per language)
5. Verify translations appear in other language tabs

---

## 🔧 Commands Reference

### Local Development
```bash
npm run dev      # Start dev server (Vite + API proxy)
npm run build    # Build production
npm run lint     # Run oxlint

cd server
npm run check    # Run API tests
```

### AWS Setup (from project root)
```bash
# All-in-one setup
bash server/setup-aws-all.sh

# Individual steps
bash server/setup-cors.mjs                    # S3 CORS
bash server/setup-bedrock-iam.sh <profile>   # Bedrock permissions
bash server/setup-budget-interactive.sh       # Budget alerts
```

### Terminal Testing
```bash
# Local tests
cd server && npm run check

# Live EC2 tests
bash server/test-terminal-live.sh https://nhatprx.com
bash server/test-terminal-live.sh http://localhost:8787
```

---

## 📝 API Endpoints Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/content` | No | Get published content |
| POST | `/api/admin/login` | No | Login with passkey |
| PUT | `/api/content` | ✓ Yes | Save content to S3 |
| POST | `/api/translate` | ✓ Yes | Translate with Bedrock |
| POST | `/api/terminal/exec` | No | Run read-only command |
| POST | `/api/resume/presign` | ✓ Yes | Get presigned S3 URL |

---

## 🚀 Deployment Notes

After pushing to main, GitHub Actions:
1. Runs linter and builds
2. Deploys dist/ to Nginx
3. Restarts `nhatprx-api` systemd service

Terminal output appears live because:
- API runs on same EC2 instance
- Commands execute with fixed argv allowlist
- No SSH tunnel needed
- Real stdout returned in 5 seconds or less

---

## ⚠️ Known Limitations

1. **Terminal**: Only allowlisted commands can run. Not a full shell.
2. **Admin saves**: Requires authentication. Content saved locally if offline.
3. **Bedrock**: Translation requires model access enabled in AWS Console.
4. **Budget**: AWS Budget alerts don't stop resources automatically.

---

## 📚 Related Files

- Terminal: `src/components/terminal/` and `server/terminal.mjs`
- Admin: `src/components/Admin/`
- Content: `src/services/contentStorage.ts`
- API: `server/index.mjs`
- Setup scripts: `server/setup-*.sh`
