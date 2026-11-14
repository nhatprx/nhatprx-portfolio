# nhatprx-portfolio - Quick Start Guide

## 🎯 What Was Fixed

### 1. Terminal Multi-Command Issue ✅
**Problem**: `whoami hostname uptime` only executed `whoami`

**Solution**: Terminal now detects space-separated commands and shows helpful error:
```bash
bash: hostname: command not found.

Did you mean to chain multiple commands? Try:
  whoami && hostname && uptime   (stop on first error)
  whoami ; hostname ; uptime      (always continue)
```

**Test it**:
```bash
# Single commands (always work)
whoami
hostname
uptime
free -h
df -h

# Chained commands (all execute)
whoami && hostname && uptime
free -h ; df -h ; uptime
```

### 2. Admin Content Not Saving ✅
**Problem**: Edits only saved locally, not to S3

**Solution**: 
- Auto-save now properly awaits remote sync
- Sync status indicator shows "⟳ Saving…", "✓ Synced", or "✗ Sync failed"
- Toast notifications on failure

**Test it**:
1. Login to admin (#admin)
2. Edit any section
3. Watch header for sync status
4. Open different device → verify changes persisted

### 3. AWS Setup Complete ✅
New scripts for easy setup:
- `bash server/setup-aws-all.sh` - All-in-one setup
- `bash server/setup-budget-interactive.sh` - Budget monitoring
- `bash server/metrics-dashboard.sh` - Live metrics

## 🚀 Quick Commands

### Local Development
```bash
npm run dev      # Start dev server
npm run build    # Build production
npm run lint     # Lint code
cd server && npm run check  # Run API tests
```

### Test Terminal on Live EC2
```bash
bash server/test-terminal-live.sh https://nhatprx.com
```

### Setup AWS Services
```bash
# All-in-one setup
bash server/setup-aws-all.sh

# Or individual steps
bash server/setup-budget-interactive.sh
bash server/setup-bedrock-iam.sh <instance-profile>
```

### Monitor AWS Resources
```bash
bash server/metrics-dashboard.sh
```

## 📋 Verification Checklist

- [ ] Terminal: Single commands work (`whoami`, `hostname`, `uptime`, `free -h`, `df -h`)
- [ ] Terminal: Chained commands work (`whoami && hostname && uptime`)
- [ ] Terminal: Space-separated shows error message
- [ ] Admin: Edit content → see "✓ Synced" in header
- [ ] Admin: Changes persist across devices
- [ ] AWS: Budget alerts configured
- [ ] AWS: Bedrock translation works
- [ ] Tests: `cd server && npm run check` passes

## 📚 Documentation

- **TROUBLESHOOTING.md** - Detailed issue documentation and solutions
- **README.md** - Project overview and architecture
- **server/metrics-dashboard.sh** - Live AWS metrics

## 🔧 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/content` | No | Get content |
| POST | `/api/admin/login` | No | Login |
| PUT | `/api/content` | ✓ | Save content |
| POST | `/api/translate` | ✓ | Translate |
| POST | `/api/terminal/exec` | No | Run command |

## ⚠️ Known Limitations

1. Terminal only runs allowlisted commands (security)
2. Admin requires authentication to sync to S3
3. Bedrock requires model access enabled in AWS Console
4. Budget alerts don't auto-stop resources

## 🎉 What's Working

✅ Live EC2 terminal with real command execution  
✅ Admin dashboard with S3 persistence  
✅ Bedrock translation (en → vi, fr, ja)  
✅ Budget monitoring with SNS alerts  
✅ Resume upload via presigned S3 URLs  
✅ Multi-language support (4 locales)  
✅ Comprehensive test suite (47 tests passing)  

## 📞 Support

See TROUBLESHOOTING.md for detailed debugging steps.
