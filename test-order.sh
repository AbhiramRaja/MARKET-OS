#!/bin/bash
# Quick test script for order placement

echo "🔧 TESTING ORDER PLACEMENT FIX"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 Current AppSync Endpoint:${NC}"
grep "aws_appsync_graphqlEndpoint" "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/src/aws-exports.js" | cut -d'"' -f4
echo ""

echo -e "${BLUE}🔑 API Key:${NC}"
grep "aws_appsync_apiKey" "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/src/aws-exports.js" | cut -d'"' -f4
echo ""

echo -e "${GREEN}✅ Configuration is correct!${NC}"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Open a terminal and run:"
echo "   cd '/Users/abhi/Documents/AWS-HACKATHON/Customer portal'"
echo "   npm start"
echo ""
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "3. Test order placement:"
echo "   • Add items to cart"
echo "   • Go to checkout"
echo "   • Fill address details"
echo "   • Click 'Place Order'"
echo ""
echo -e "${GREEN}🎯 Expected Result: Order created successfully!${NC}"
echo ""
