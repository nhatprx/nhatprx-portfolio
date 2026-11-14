#!/bin/bash
# Live metrics dashboard for nhatprx-portfolio AWS resources
# Shows real-time EC2, S3, and Bedrock usage

set -e

REGION="${AWS_REGION:-ap-southeast-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

clear_screen() {
  clear
}

print_header() {
  echo "╔════════════════════════════════════════════════════════════════════════════════╗"
  echo "║                    nhatprx-portfolio AWS Metrics Dashboard                      ║"
  echo "║                          Region: $REGION"
  echo "║                          Account: $ACCOUNT_ID"
  echo "║                          Updated: $(date '+%Y-%m-%d %H:%M:%S')                          ║"
  echo "╚════════════════════════════════════════════════════════════════════════════════╝"
}

get_ec2_metrics() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "EC2 INSTANCES"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  aws ec2 describe-instances \
    --region "$REGION" \
    --query 'Reservations[*].Instances[?State.Name==`running`].[InstanceId,InstanceType,LaunchTime,Tags[?Key==`Name`].Value|[0]]' \
    --output table
}

get_s3_metrics() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "S3 BUCKETS & STORAGE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo "Buckets containing 'nhatprx':"
  aws s3 ls --region "$REGION" | grep -i nhatprx || echo "No buckets found"
  
  echo ""
  echo "Bucket sizes and object counts:"
  for bucket in $(aws s3 ls --region "$REGION" | grep -i nhatprx | awk '{print $3}'); do
    if [ -n "$bucket" ]; then
      echo "  $bucket:"
      OBJECT_COUNT=$(aws s3 ls "s3://$bucket" --recursive --region "$REGION" | wc -l)
      TOTAL_SIZE=$(aws s3 ls "s3://$bucket" --recursive --region "$REGION" --summarize | grep "Total Size" | awk '{print $3}')
      echo "    Objects: $OBJECT_COUNT"
      echo "    Size: $((TOTAL_SIZE / 1024 / 1024)) MB"
    fi
  done
}

get_budget_metrics() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "BUDGET ALERTS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  aws budgets describe-budgets \
    --region "$REGION" \
    --query 'Budgets[?contains(BudgetName, `nhatprx`)].[BudgetName,BudgetType,TimeUnit,BudgetLimit.Amount,BudgetLimit.Unit]' \
    --output table || echo "No budgets found"
}

get_bedrock_metrics() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "BEDROCK MODEL ACCESS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  aws bedrock list-foundation-models \
    --region "$REGION" \
    --by-provider "Anthropic" \
    --query 'modelSummaries[].[modelId,modelName,modelStatus]' \
    --output table || echo "Bedrock not available in this region"
}

get_cloudwatch_metrics() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "CLOUDWATCH METRICS (Last 24 hours)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Get EC2 CPU utilization
  echo "EC2 CPU Utilization (avg):"
  START_TIME=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S)
  END_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)
  
  aws cloudwatch get-metric-statistics \
    --region "$REGION" \
    --namespace AWS/EC2 \
    --metric-name CPUUtilization \
    --dimensions Name=InstanceId,Value="$(aws ec2 describe-instances --region "$REGION" --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null || echo '')" \
    --start-time "$START_TIME" \
    --end-time "$END_TIME" \
    --period 3600 \
    --statistics Average \
    --query 'Datapoints[].Average' \
    --output text 2>/dev/null | awk '{for(i=1;i<=NF;i++)printf "  %.1f%%\n",$i}' || echo "  No data"
}

get_cost_summary() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "ESTIMATED MONTHLY COSTS (Current month)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  START_OF_MONTH=$(date -u -d "$(date +%Y-%m-01)" +%Y-%m-%d)
  TODAY=$(date -u +%Y-%m-%d)
  
  aws ce get-cost-and-usage \
    --region "$REGION" \
    --time-period Start="$START_OF_MONTH",End="$TODAY" \
    --granularity MONTHLY \
    --metrics "BlendedCost" \
    --group-by Type=DIMENSION,Key=SERVICE \
    --query 'ResultsByTime[0].Groups[?Keys[0]!=`Tax`].[Keys[0],Metrics.BlendedCost.Amount]' \
    --output table 2>/dev/null || echo "Cost data unavailable"
}

main() {
  if ! command -v aws >/dev/null 2>&1; then
    echo "AWS CLI not found"
    exit 1
  fi
  
  clear_screen
  print_header
  get_ec2_metrics
  get_s3_metrics
  get_budget_metrics
  get_bedrock_metrics
  get_cloudwatch_metrics
  get_cost_summary
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Press Ctrl+C to exit | Refresh with 'watch -n 60 bash server/metrics-dashboard.sh'"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main
