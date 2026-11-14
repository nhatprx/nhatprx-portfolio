#!/usr/bin/env bash
# Creates or updates the AWS Budget for this portfolio.
#
#   bash setup-budget.sh                 -> monthly $11.67 budget (=$140/year)
#   bash setup-budget.sh 20              -> monthly $20 budget
#
# Requires AWS CLI credentials that can create/update budgets and SNS topics.
set -eu

BUDGET_NAME="${BUDGET_NAME:-nhatprx-portfolio-monthly}"
MONTHLY_LIMIT="${1:-11.67}"
ALERT_THRESHOLD="${ALERT_THRESHOLD:-80}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
SNS_TOPIC_NAME="${SNS_TOPIC_NAME:-nhatprx-portfolio-budget-alerts}"

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" >&2
  exit 1
fi

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
CALLER="$(aws sts get-caller-identity --query Arn --output text)"
REGION="${AWS_REGION:-ap-southeast-1}"

if [ -z "$ALERT_EMAIL" ]; then
  echo "ALERT_EMAIL is required (the AWS account email used for budget notifications)." >&2
  exit 1
fi

TOPIC_ARN="$(aws sns create-topic \
  --region "$REGION" \
  --name "$SNS_TOPIC_NAME" \
  --query TopicArn \
  --output text)"

aws sns subscribe \
  --region "$REGION" \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$ALERT_EMAIL" >/dev/null

BUDGET_JSON="$(mktemp)"
trap 'rm -f "$BUDGET_JSON"' EXIT
cat > "$BUDGET_JSON" <<JSON
{
  "BudgetName": "$BUDGET_NAME",
  "BudgetType": "COST",
  "TimeUnit": "MONTHLY",
  "BudgetLimit": {
    "Amount": "$MONTHLY_LIMIT",
    "Unit": "USD"
  },
  "CostFilters": {
    "Service": [
      "Amazon EC2",
      "Amazon S3",
      "Amazon Bedrock"
    ]
  }
}
JSON

EXISTING_BUDGET_ID="$(aws budgets describe-budgets \
  --region "$REGION" \
  --budget-names "$BUDGET_NAME" \
  --query 'Budgets[0].BudgetArn' \
  --output text 2>/dev/null || true)"

if [ "$EXISTING_BUDGET_ID" = "None" ] || [ -z "$EXISTING_BUDGET_ID" ]; then
  aws budgets create-budget --region "$REGION" --cli-input-json "file://$BUDGET_JSON" >/dev/null
  ACTION="created"
else
  aws budgets update-budget \
    --region "$REGION" \
    --budget-arn "$EXISTING_BUDGET_ID" \
    --cli-input-json "file://$BUDGET_JSON" >/dev/null
  ACTION="updated"
fi

aws budgets create-notification \
  --region "$REGION" \
  --budget-arn "$EXISTING_BUDGET_ID" \
  --notification-type ACTUAL \
  --comparison-operator GREATER_THAN \
  --threshold "$ALERT_THRESHOLD" \
  --threshold-type PERCENTAGE \
  --subscribers \
    "SubscriptionType=EMAIL,Address=$ALERT_EMAIL" >/dev/null

cat <<EOF
Budget $ACTION successfully.

Account: $ACCOUNT_ID
Caller: $CALLER
Budget: $BUDGET_NAME
Monthly limit: $$MONTHLY_LIMIT USD
Annual target: $$(awk "BEGIN { printf \"%.2f\", $MONTHLY_LIMIT * 12 }") USD
Services: EC2, S3, Bedrock
Alert: $ALERT_THRESHOLD% of monthly limit
Alert email: $ALERT_EMAIL

Important: AWS Budget alerts do not stop resources. Add an EC2 scheduled shutdown or
an AWS Cost Anomaly Detection alarm if costs must be capped automatically.
EOF
