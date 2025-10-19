#!/bin/bash
# Visual Search Test Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Testing Visual Search Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"

echo -e "${BLUE}1. Checking AppSync Configuration:${NC}"
APPSYNC_URL=$(grep "aws_appsync_graphqlEndpoint" src/aws-exports.js | cut -d'"' -f4)
echo "   Endpoint: $APPSYNC_URL"

if [ -n "$APPSYNC_URL" ]; then
    echo -e "   ${GREEN}✅ AppSync configured${NC}"
else
    echo -e "   ${RED}❌ AppSync not configured${NC}"
fi
echo ""

echo -e "${BLUE}2. Checking Lambda Function:${NC}"
LAMBDA_STATUS=$(amplify function status 2>&1 | grep awshackathon7a367bce | awk '{print $3}')
echo "   Status: $LAMBDA_STATUS"

if [ "$LAMBDA_STATUS" = "Change" ] || [ "$LAMBDA_STATUS" = "No" ]; then
    echo -e "   ${GREEN}✅ Lambda function exists${NC}"
else
    echo -e "   ${YELLOW}⚠️  Lambda may need deployment${NC}"
fi
echo ""

echo -e "${BLUE}3. Checking Lambda Source Files:${NC}"
if [ -f "amplify/backend/function/awshackathon7a367bce/src/index.js" ]; then
    echo -e "   ${GREEN}✅ index.js exists${NC}"
else
    echo -e "   ${RED}❌ index.js missing${NC}"
fi

if [ -f "amplify/backend/function/awshackathon7a367bce/src/products.json" ]; then
    PRODUCT_COUNT=$(grep -o '"id"' amplify/backend/function/awshackathon7a367bce/src/products.json | wc -l | tr -d ' ')
    echo -e "   ${GREEN}✅ products.json exists ($PRODUCT_COUNT products)${NC}"
else
    echo -e "   ${RED}❌ products.json missing${NC}"
fi
echo ""

echo -e "${BLUE}4. Checking GraphQL Schema:${NC}"
if grep -q "@function.*awshackathon7a367bce" amplify/backend/api/awshackathon/schema.graphql; then
    echo -e "   ${GREEN}✅ @function directive configured${NC}"
else
    echo -e "   ${RED}❌ @function directive missing${NC}"
fi
echo ""

echo -e "${BLUE}5. Checking Visual Search Components:${NC}"
if [ -f "src/components/VisualSearchModal.jsx" ]; then
    echo -e "   ${GREEN}✅ VisualSearchModal.jsx exists${NC}"
else
    echo -e "   ${RED}❌ VisualSearchModal.jsx missing${NC}"
fi

if [ -f "src/services/AWSVisualSearchService.js" ]; then
    echo -e "   ${GREEN}✅ AWSVisualSearchService.js exists${NC}"
else
    echo -e "   ${RED}❌ AWSVisualSearchService.js missing${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Configuration Check Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}📋 To Test Visual Search:${NC}"
echo "1. Start the portal: npm start"
echo "2. Open http://localhost:3000"
echo "3. Click the camera icon 📷 in the search bar"
echo "4. Upload an image (phone, laptop, shoes, etc.)"
echo "5. Click 'Search with Image'"
echo ""

echo -e "${BLUE}💡 If visual search doesn't work:${NC}"
echo "• Check browser console for errors (F12)"
echo "• Look for 'AWS Visual Search Error' messages"
echo "• Try the mock service as fallback"
echo ""

echo -e "${GREEN}Ready to test! 🚀${NC}"
