#!/bin/bash
# Complete AWS Setup for nhatprx-portfolio
# Runs all required AWS setup steps in sequence

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║    AWS Setup for nhatprx-portfolio                     ║"
echo "║    • Budget monitoring                                 ║"
echo "║    • Bedrock permissions                               ║"
echo "║    • S3 CORS (for resume uploads)                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check AWS CLI
if ! command -v aws >/dev/null 2>&1; then
  echo "❌ AWS CLI not found. Install it:"
  echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

# Verify credentials
echo "Checking AWS credentials..."
if ! ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null); then
  echo "❌ AWS credentials not configured. Run: aws configure"
  exit 1
fi
echo "✓ Account: $ACCOUNT"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGION="${AWS_REGION:-ap-southeast-1}"

# 1. Setup S3 CORS (for resume uploads from browser)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Setup S3 CORS for presigned uploads"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ -f "$SCRIPT_DIR/setup-cors.mjs" ]; then
  node "$SCRIPT_DIR/setup-cors.mjs" || true
  echo ""
else
  echo "⚠ setup-cors.mjs not found, skipping"
  echo ""
fi

# 2. Setup Bedrock permissions (if running on EC2)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Setup Bedrock permissions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running on EC2 by looking for instance profile
INSTANCE_PROFILE=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ 2>/dev/null || echo "")

if [ -z "$INSTANCE_PROFILE" ]; then
  echo "⊘ Not running on EC2. Bedrock permissions must be set up on the instance."
  echo "   When deployed to EC2, run:"
  echo "   bash server/setup-bedrock-iam.sh <instance-profile-name>"
  echo ""
else
  read -p "Setup Bedrock permissions for instance? (y/n): " SETUP_BEDROCK
  if [ "$SETUP_BEDROCK" = "y" ] || [ "$SETUP_BEDROCK" = "Y" ]; then
    if [ -f "$SCRIPT_DIR/setup-bedrock-iam.sh" ]; then
      bash "$SCRIPT_DIR/setup-bedrock-iam.sh" "$INSTANCE_PROFILE"
      echo ""
    fi
  fi
fi

# 3. Setup Budget monitoring
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Setup Budget monitoring"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Setup monthly budget alerts? (y/n): " SETUP_BUDGET
if [ "$SETUP_BUDGET" = "y" ] || [ "$SETUP_BUDGET" = "Y" ]; then
  read -p "Alert email address: " ALERT_EMAIL
  read -p "Monthly budget limit in USD (default 11.67): " BUDGET_LIMIT
  BUDGET_LIMIT="${BUDGET_LIMIT:-11.67}"
  
  ALERT_EMAIL="$ALERT_EMAIL" bash "$SCRIPT_DIR/setup-budget.sh" "$BUDGET_LIMIT"
  echo ""
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ AWS Setup Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "What's been configured:"
echo "  ✓ S3 CORS: Browser can upload resumes directly to S3"
echo "  ✓ Bedrock: Admin dashboard can translate content"
echo "  ✓ Budget: Monthly spending alerts"
echo ""
echo "Next steps:"
echo "  1. If running on EC2:"
echo "     • Verify Bedrock model access in AWS Console > Bedrock > Model Access"
echo "     • Check that claude-3-5-haiku is enabled"
echo ""
echo "  2. If using Bedrock for translations:"
echo "     • In admin dashboard, click 'Auto Translate'"
echo "     • Select target languages"
echo ""
echo "  3. Monitor spending:"
echo "     echo "Check AWS Console > Budgets"
echo "     • Confirm email subscription for budget alerts"
echo ""
