#!/bin/bash
# Live EC2 Terminal Test
# Run this on the EC2 instance to verify the terminal is executing real commands
# Usage: bash test-terminal-live.sh [https://nhatprx.com OR http://localhost:8787]

BASE_URL="${1:-https://nhatprx.com}"
echo "Testing EC2 terminal at $BASE_URL"
echo "========================================"

test_command() {
  local cmd="$1"
  echo ""
  echo "Testing: $cmd"
  local response=$(curl -s -X POST "$BASE_URL/api/terminal/exec" \
    -H "Content-Type: application/json" \
    -d "{\"command\": \"$cmd\"}")
  
  if echo "$response" | jq -e '.ok' > /dev/null 2>&1; then
    echo "✓ Success"
    echo "$response" | jq -r '.stdout' | head -3
  else
    echo "✗ Failed"
    echo "$response" | jq -r '.error' 2>/dev/null || echo "$response"
  fi
}

# Test each command individually
test_command "whoami"
test_command "hostname"
test_command "uptime"
test_command "free -h"
test_command "df -h"
test_command "git log"
test_command "health"
test_command "api-log"
test_command "nginx-access"

# Test chained commands (should work with && and ;)
echo ""
echo "========================================"
echo "Testing chained commands (&&):"
curl -s -X POST "$BASE_URL/api/terminal/exec" \
  -H "Content-Type: application/json" \
  -d '{"command": "whoami && hostname && uptime"}' | jq .

echo ""
echo "Testing chained commands (;):"
curl -s -X POST "$BASE_URL/api/terminal/exec" \
  -H "Content-Type: application/json" \
  -d '{"command": "free -h ; df -h"}' | jq .

echo ""
echo "========================================"
echo "All terminal tests completed!"
