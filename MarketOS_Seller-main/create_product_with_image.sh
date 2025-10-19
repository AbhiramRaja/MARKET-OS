#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
API="https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod/"

usage() {
  echo "Usage: bash create_product_with_image.sh <path_to_image> [--name \"Product Name\"] [--price 999] [--seller SELLER_DEMO]"
  exit 1
}

[[ $# -lt 1 ]] && usage

FILEPATH="$1"; shift || true
[[ ! -f "$FILEPATH" ]] && { echo "File not found: $FILEPATH"; exit 1; }

# Defaults
NAME=""
PRICE="999"
SELLER="SELLER_DEMO"

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)   NAME="$2"; shift 2 ;;
    --price)  PRICE="$2"; shift 2 ;;
    --seller) SELLER="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; usage ;;
  esac
done

FILENAME="$(basename "$FILEPATH")"
BASENAME="${FILENAME%.*}"
EXT_LOWER="$(echo "${FILENAME##*.}" | tr '[:upper:]' '[:lower:]')"

# Derive sensible defaults
[[ -z "$NAME" ]] && NAME="$BASENAME"

# Map ext -> content-type
CONTENT_TYPE="image/jpeg"
case "$EXT_LOWER" in
  jpg|jpeg) CONTENT_TYPE="image/jpeg" ;;
  png)      CONTENT_TYPE="image/png" ;;
  webp)     CONTENT_TYPE="image/webp" ;;
  gif)      CONTENT_TYPE="image/gif" ;;
esac

UUID="$(uuidgen)"
KEY="${SELLER}/products/${BASENAME}-${UUID}.${EXT_LOWER}"

echo "→ Requesting pre-signed URL for: $KEY ($CONTENT_TYPE)"
RESP="$(curl -s -X POST "${API}api/upload-url" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"$KEY\",\"contentType\":\"$CONTENT_TYPE\"}")"

UPLOAD_URL="$(echo "$RESP" | jq -r .uploadUrl)"
[[ "$UPLOAD_URL" = "null" || -z "$UPLOAD_URL" ]] && { echo "❌ Failed to get upload URL: $RESP"; exit 1; }

echo "→ Uploading image to S3..."
HTTP_CODE="$(curl -s -X PUT -T "$FILEPATH" -H "Content-Type: $CONTENT_TYPE" "$UPLOAD_URL" -o /dev/null -w "%{http_code}")"
[[ "$HTTP_CODE" != "200" ]] && { echo "❌ Upload failed (HTTP $HTTP_CODE). The URL may have expired; run again."; exit 1; }
echo "✅ Upload successful."

echo "→ Creating product: \"$NAME\" (price: $PRICE, seller: $SELLER)"
CREATE_RESP="$(curl -s -X POST "${API}api/products" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"price\":$PRICE,\"sellerId\":\"$SELLER\",\"images\":[\"$KEY\"]}")"

echo "✅ Product created:"
echo "$CREATE_RESP" | jq .
