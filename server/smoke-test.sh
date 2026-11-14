#!/usr/bin/env bash
# Smoke test for the nhatprx-portfolio admin API.
# Usage: bash smoke-test.sh [base-url] [passkey]
BASE="${1:-http://127.0.0.1:8787}"
PASSKEY="${2:-admin2026}"

echo "--- health ---"
curl -s "$BASE/api/health"; echo

echo "--- login with wrong passkey (expect 401) ---"
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/admin/login" \
  -H 'Content-Type: application/json' -d '{"passkey":"definitely-wrong"}'

echo "--- login with correct passkey ---"
TOKEN=$(curl -s -X POST "$BASE/api/admin/login" \
  -H 'Content-Type: application/json' \
  -d "{\"passkey\":\"$PASSKEY\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "$PASSKEY" ]; then
  echo "FAIL: could not obtain a token"
  exit 1
fi
echo "token acquired (${#TOKEN} chars)"

echo "--- presign without auth (expect 401) ---"
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/resume/presign" \
  -H 'Content-Type: application/json' \
  -d '{"fileName":"a.pdf","contentType":"application/pdf","size":1000}'

echo "--- presign with auth ---"
curl -s -X POST "$BASE/api/resume/presign" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"fileName":"smoke-test.pdf","contentType":"application/pdf","size":1000}' | head -c 400; echo

echo "--- presign rejects a non-resume file type (expect 400) ---"
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/resume/presign" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"fileName":"evil.exe","contentType":"application/octet-stream","size":1000}'

echo "--- content GET (public) ---"
curl -s "$BASE/api/content" | head -c 120; echo

echo "--- content PUT with auth ---"
curl -s -o /dev/null -w '%{http_code}\n' -X PUT "$BASE/api/content" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"content":{"en":{"label":"smoke-test"}}}'

echo "--- content PUT without auth (expect 401) ---"
curl -s -o /dev/null -w '%{http_code}\n' -X PUT "$BASE/api/content" \
  -H 'Content-Type: application/json' -d '{"content":{"en":{"label":"x"}}}'