#!/usr/bin/env bash
# Adds only the Bedrock permissions the admin API needs to the EC2 instance
# profile, without replacing unrelated permissions that may already exist.
#
# Usage: bash setup-bedrock-iam.sh <instance-profile-name>
set -eu

PROFILE_NAME="${1:?usage: setup-bedrock-iam.sh <instance-profile-name>}"
POLICY_NAME="${POLICY_NAME:-nhatprx-portfolio-bedrock-invoke}"

cat > /tmp/nhatprx-bedrock-policy.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokePortfolioTranslationModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }
  ]
}
JSON

aws iam put-role-policy \
  --role-name "$PROFILE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document file:///tmp/nhatprx-bedrock-policy.json
rm -f /tmp/nhatprx-bedrock-policy.json

echo "Bedrock invoke permissions added to $PROFILE_NAME"
echo "Enable model access in Bedrock and verify with:"
echo "  aws bedrock list-foundation-models --region ${AWS_REGION:-ap-southeast-1} --by-output-format-modality ON_DEMAND --query 'modelSummaries[?contains(modelId, \`claude\`)].modelId'"
