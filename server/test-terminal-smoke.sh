#!/usr/bin/env bash
# Smoke test for the public terminal endpoint on the EC2 node.
#
# Terminal requests must be signed, so this script mirrors what the browser
# does: fetch a token bound to a client id, then HMAC-sign each command.
set -eu

BASE="${1:-http://127.0.0.1:8787}"
CLIENT_ID="smoke_client_$$"

TOKEN=$(curl -s -X POST "$BASE/api/terminal/token" \
  -H 'Content-Type: application/json' \
  -d "{\"clientId\":\"$CLIENT_ID\"}" \
  | sed -E 's/.*"token":"([^"]+)".*/\1/')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "$BASE" ]; then
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

run() {
  local cmd="$1"
  local ts payload sig
  ts=$(date +%s%3N)
  payload="$CLIENT_ID|$ts|$cmd"
  sig=$(hmac_sha256 "$TOKEN" "$payload")

  printf '%s -> ' "$cmd"
  curl -s -X POST "$BASE/api/terminal/exec" \
    -H 'Content-Type: application/json' \
    -H "X-Request-Signature: $sig" \
    -H "X-Client-Id: $CLIENT_ID" \
    -H "X-Terminal-Token: $TOKEN" \
    -H "X-Timestamp: $ts" \
    -d "{\"command\":\"$cmd\"}"
  printf '\n'
}

echo "--- allowed commands ---"
run uname
run uptime
run free
run df
run whoami
run hostname
run systemctl-nhatprx
run nginx-status

echo "--- rejections (expect errors) ---"
run 'rm -rf /'
run 'sudo'
run 'docker ps'
run 'uname; cat /etc/passwd'
