#!/usr/bin/env bash
set -euo pipefail

API_ID="${1:-}"
AUTH_ID="${2:-}"
REGION="${3:-ap-south-1}"
STAGE="${4:-prod}"

if [[ -z "$API_ID" || -z "$AUTH_ID" ]]; then
  echo "Usage: $0 <rest-api-id> <authorizer-id> [region] [stage]" >&2
  exit 1
fi

echo "API_ID=$API_ID  AUTH_ID=$AUTH_ID  REGION=$REGION  STAGE=$STAGE"

RES_JSON="$(aws apigateway get-resources --rest-api-id "$API_ID" --region "$REGION")"

rid() { echo "$RES_JSON" | jq -r --arg p "$1" '.items[] | select(.path == $p) | .id'; }

# NOTE: your API resources are under /api/...
PATHS=(
  "/api"
  "/api/orders"
  "/api/orders/{id}"
  "/api/products"
  "/api/products/{id}"
  "/api/sellers"
  "/api/sellers/{id}"
  "/api/sellers/me"
  "/api/presign"
)

update_method () {
  local RID="$1" M="$2"
  aws apigateway update-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RID" \
    --http-method "$M" \
    --region "$REGION" \
    --patch-operations \
      op=replace,path=/authorizationType,value=COGNITO_USER_POOLS \
      op=replace,path=/authorizerId,value="$AUTH_ID" \
  >/dev/null
}

for P in "${PATHS[@]}"; do
  RID="$(rid "$P" || true)"
  [[ -z "$RID" || "$RID" == "null" ]] && { echo "skip $P (no resource)"; continue; }
  METHODS_JSON="$(echo "$RES_JSON" | jq -r --arg id "$RID" '.items[] | select(.id==$id) | .resourceMethods | keys[]?' 2>/dev/null || true)"
  [[ -z "$METHODS_JSON" ]] && { echo "skip $P (no methods)"; continue; }
  echo "Updating $P (rid=$RID)"
  while read -r M; do
    [[ -z "$M" ]] && continue
    if update_method "$RID" "$M"; then
      echo "  ✓ $M -> Cognito authorizer"
    else
      echo "  ! $M not updated"
    fi
  done <<< "$METHODS_JSON"
done

DEPLOY_ID="$(aws apigateway create-deployment --rest-api-id "$API_ID" --stage-name "$STAGE" --region "$REGION" --query id --output text)"
echo "Deployed stage '$STAGE' (deploymentId=$DEPLOY_ID)"
