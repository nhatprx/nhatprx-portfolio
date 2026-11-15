#!/bin/bash
# Live EC2 Terminal Test
# Run this on the EC2 instance to verify the terminal is executing real commands
# Usage: bash test-terminal-live.sh [https://nhatprx.com OR http://localhost:8787]

BASE_URL="${1:-https://nhatprx.com}"
echo "Testing EC2 terminal at $BASE_URL"
echo "========================================"

# Terminal requests must be signed, so this script mirrors what the browser
# does: fetch a token bound to a client id, then HMAC-sign each command.
CLIENT_ID="live_client_$$"

TOKEN=$(curl -s -X POST "$BASE_URL/api/terminal/token" \
  -H 'Content-Type: application/json' \
  -d "{\"clientId\":\"$CLIENT_ID\"}" \
  | sed -E 's/.*"token":"([^"]+)".*/\1/')

if [ -z "$TOKEN" ]; then
  echo "FAIL: could not obtain a terminal token"
  exit 1
fi
echo "terminal token acquired"

# hmac_sha256 <key> <data> -> lowercase hex
# Uses node rather than openssl: node is guaranteed on the host because the
# API itself runs on it.
hmac_sha256() {
  node -e "console.log(require('node:crypto').createHmac('sha256', process.argv[1]).update(process.argv[2]).digest('hex'))" "$1" "$2"
}

# exec_signed <command> -> raw JSON response
exec_signed() {
  local cmd="$1"
  local ts payload sig
  ts=$(date +%s%3N)
  payload="$CLIENT_ID|$ts|$cmd"
  sig=$(hmac_sha256 "$TOKEN" "$payload")

  curl -s -X POST "$BASE_URL/api/terminal/exec" \
    -H 'Content-Type: application/json' \
    -H "X-Request-Signature: $sig" \
    -H "X-Client-Id: $CLIENT_ID" \
    -H "X-Terminal-Token: $TOKEN" \
    -H "X-Timestamp: $ts" \
    -d "{\"command\": \"$cmd\"}"
}

test_command() {
  local cmd="$1"
  echo ""
  echo "Testing: $cmd"
  local response=$(exec_signed "$cmd")

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
test_command "free"
test_command "df"
test_command "git log"
test_command "health"
test_command "api-log"
test_command "nginx-access"

# Test chained commands (should work with && and ;)
echo ""
echo "========================================"
echo "Testing chained commands (&&):"
exec_signed "whoami && hostname && uptime" | jq .

echo ""
echo "Testing chained commands (;):"
exec_signed "free ; df" | jq .

echo ""
echo "========================================"
echo "All terminal tests completed!"
