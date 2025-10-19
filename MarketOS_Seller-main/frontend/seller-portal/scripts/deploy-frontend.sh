#!/usr/bin/env bash
set -euo pipefail

STACK="SellerFrontendStack"
REGION="${REGION:-ap-south-1}"
APPNAME="${APPNAME:-marketos-seller-portal}"
TEMPLATE="infra/cloudfront-s3-spa.yaml"
FRONTEND_DIR="."
DIST_DIR="dist"

echo "== Build =="
npm ci --silent || npm i
npm run build

echo "== Deploy stack ($STACK) =="
aws cloudformation deploy \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --parameter-overrides AppName="$APPNAME" \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --region "$REGION"

echo "== Resolve outputs =="
BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DISTID=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
DOMAIN=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" --output text)

echo "Bucket: $BUCKET"
echo "DistID: $DISTID"
echo "Domain: https://$DOMAIN"

echo "== Upload site =="
aws s3 sync "$DIST_DIR/" "s3://$BUCKET/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

aws s3 cp "$DIST_DIR/index.html" "s3://$BUCKET/index.html" \
  --cache-control "no-cache"

echo "== Invalidate =="
aws cloudfront create-invalidation --distribution-id "$DISTID" --paths "/*" >/dev/null

echo "✅ Deployed: https://$DOMAIN"
