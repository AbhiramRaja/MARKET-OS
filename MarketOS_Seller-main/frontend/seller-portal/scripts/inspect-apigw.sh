#!/usr/bin/env bash
set -euo pipefail
API_ID="${1:-}"; REGION="${2:-ap-south-1}"
[[ -z "$API_ID" ]] && { echo "Usage: $0 <rest-api-id> [region]"; exit 1; }
RES="$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION")"
echo "$RES" | jq -r '.items[] | .path as $p | .resourceMethods? // {} | to_entries[]? | "\($p) \(.key)"' | while read -r PATH METHOD; do
  RID=$(echo "$RES" | jq -r --arg p "$PATH" '.items[] | select(.path==$p) | .id')
  META="$(aws apigateway get-method --rest-api-id "$API_ID" --resource-id "$RID" --http-method "$METHOD" --region "$REGION")"
  AUTH_TYPE="$(echo "$META" | jq -r '.authorizationType')"
  AUTH_ID="$(echo "$META" | jq -r '.authorizerId // "-"')"
  echo "$METHOD  $PATH   auth=$AUTH_TYPE  authorizerId=$AUTH_ID"
done
