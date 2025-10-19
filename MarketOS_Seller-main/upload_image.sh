#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
API="https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod/"
PRODUCT_ID="ffff4b0c-0fb6-4718-815c-cd78dd79e24f"

if [ $# -lt 1 ]; then
  echo "Usage: bash upload_image.sh <path_to_image>"
  exit 1
fi

FILEPATH="$1"
if [ ! -f "$FILEPATH" ]; then
  echo "File not found: $FILEPATH"
  exit 1
fi

FILENAME=$(basename "$FILEPATH")
EXT="${FILENAME##*.}"
UUID=$(uuidgen)
KEY="SELLER_DEMO/products/sample-${UUID}.${EXT}"

echo "→ Generating a fresh upload URL for $FILENAME ..."
RESP=$(curl -s -X POST "${API}api/upload-url" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"$KEY\",\"contentType\":\"image/${EXT}\"}")

UPLOAD_URL=$(echo "$RESP" | jq -r .uploadUrl)
if [ "$UPLOAD_URL" = "null" ]; then
  echo "❌ Failed to get upload URL:"
  echo "$RESP"
  exit 1
fi

echo "→ Uploading to S3 ..."
HTTP_CODE=$(curl -s -X PUT -T "$FILEPATH" -H "Content-Type: image/${EXT}" \
  "$UPLOAD_URL" -o /dev/null -w "%{http_code}")
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Upload failed (HTTP $HTTP_CODE)"
  exit 1
fi
echo "✅ Upload successful."

echo "→ Attaching image to product ($PRODUCT_ID) ..."
UPDATE_RESP=$(curl -s -X PUT "${API}api/products/${PRODUCT_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Demo Tee\",\"price\":999,\"images\":[\"$KEY\"]}")

echo "✅ Product updated:"
echo "$UPDATE_RESP" | jq .
