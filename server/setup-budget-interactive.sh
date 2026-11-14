#!/bin/bash
# Setup AWS Budget for nhatprx-portfolio
# Interactive setup script

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║    AWS Budget Setup for nhatprx-portfolio              ║"
echo "║    Tracks EC2, S3, and Bedrock spending                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

if ! command -v aws >/dev/null 2>&1; then
  echo "❌ AWS CLI not found. Install it first:"
  echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

# Verify AWS credentials are configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "❌ AWS credentials not configured. Run:"
  echo "   aws configure"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✓ AWS Account: $ACCOUNT_ID"
echo ""

# Get email for budget alerts
read -p "Enter email for budget alerts (default: ${ALERT_EMAIL:-}): " EMAIL
ALERT_EMAIL="${EMAIL:-${ALERT_EMAIL}}"

if [ -z "$ALERT_EMAIL" ]; then
  echo "❌ Alert email is required"
  exit 1
fi

# Get monthly budget limit
read -p "Enter monthly budget limit in USD (default: 11.67): " BUDGET_INPUT
MONTHLY_LIMIT="${BUDGET_INPUT:-11.67}"

echo ""
echo "Budget Configuration:"
echo "  - Monthly limit: \$$MONTHLY_LIMIT"
echo "  - Annual target: \$(awk "BEGIN { printf \"%.2f\", $MONTHLY_LIMIT * 12 }" ) "
echo "  - Services: EC2, S3, Bedrock"
echo "  - Alert email: $ALERT_EMAIL"
echo ""

read -p "Proceed? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Setting up budget..."
ALERT_EMAIL="$ALERT_EMAIL" bash "$(dirname "$0")/setup-budget.sh" "$MONTHLY_LIMIT"

echo ""
echo "✓ Budget setup complete!"
echo ""
echo "Next steps:"
echo "  1. Check your email for SNS subscription confirmation"
echo "  2. Confirm the subscription to enable alerts"
echo "  3. Monitor spending in AWS Console > Budgets"
