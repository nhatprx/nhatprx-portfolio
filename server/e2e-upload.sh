#!/usr/bin/env bash
# End-to-end test: presign a resume upload, PUT the file to S3, verify it is
# publicly readable, then delete it and verify it is gone.
# Usage: bash e2e-upload.sh [base-url] [passkey] [file]
set -eu

BASE="${1:-http://127.0.0.1:8787}"
PASSKEY="${2:-admin2026}"
FILE="${3:-/home/ubuntu/nhatprx-api/test-resume.pdf}"

# Minimal but valid PDF.
if [ ! -f "$FILE" ]; then
  printf '%%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\n%%%%EOF\n' > "$FILE"
fi

TOKEN=$(curl -s -X POST "$BASE/api/admin/login" \
  -H 'Content-Type: application/json' \
  -d "{\"passkey\":\"$PASSKEY\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/')
echo "token acquired"

PRESIGN=$(curl -s -X POST "$BASE/api/resume/presign" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"fileName\":\"$(basename "$FILE")\",\"contentType\":\"application/pdf\",\"size\":$(stat -c%s "$FILE")}")

UPLOAD_URL=$(echo "$PRESIGN" | sed -E 's/.*"uploadUrl":"([^"]+)".*/\1/')
KEY=$(echo "$PRESIGN" | sed -E 's/.*"key":"([^"]+)".*/\1/')
PUBLIC_URL=$(echo "$PRESIGN" | sed -E 's/.*"publicUrl":"([^"]+)".*/\1/')
echo "key: $KEY"

echo "--- PUT file to S3 ---"
HTTP=$(curl -s -o /tmp/e2e-put-body.txt -w '%{http_code}' -X PUT "$UPLOAD_URL" \
  -H 'Content-Type: application/pdf' --data-binary "@$FILE")
echo "PUT status: $HTTP"
if [ "$HTTP" != "200" ]; then
  echo "S3 error body:"
  head -c 800 /tmp/e2e-put-body.txt; echo
  echo "FAIL: upload did not succeed"
  exit 1
fi

echo "--- GET public URL ---"
HTTP=$(curl -s -o /tmp/e2e-downloaded.pdf -w '%{http_code}' "$PUBLIC_URL")
echo "GET status: $HTTP"
if [ "$HTTP" = "200" ] && [ -s /tmp/e2e-downloaded.pdf ]; then
  echo "PASS: file is publicly readable ($(stat -c%s /tmp/e2e-downloaded.pdf) bytes)"
else
  echo "FAIL: file is not publicly readable"
  exit 1
fi

echo "--- DELETE via API ---"
HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/resume/delete" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"key\":\"$KEY\"}")
echo "DELETE status: $HTTP"

echo "--- verify deleted (expect 403 or 404) ---"
HTTP=$(curl -s -o /dev/null -w '%{http_code}' "$PUBLIC_URL")
echo "GET after delete: $HTTP"
# The bucket grants anonymous s3:GetObject only, so a missing key answers 403
# (not 404). Either status means the object is no longer served.
if [ "$HTTP" = "404" ] || [ "$HTTP" = "403" ]; then
  echo "PASS: object deleted"
else
  echo "FAIL: object still present"
  exit 1
fi

echo "ALL CHECKS PASSED"