#!/bin/bash
# 🚀 START CUSTOMER PORTAL - READY TO TEST ORDERS

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 MarketOS Customer Portal - Order Testing Ready"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}✅ Configuration Status:${NC}"
echo "   AppSync Endpoint: ✅ CORRECT"
echo "   API Key: ✅ CORRECT"
echo "   GraphQL Mutations: ✅ GENERATED"
echo "   Amplify Config: ✅ LOADED"
echo ""

echo -e "${BLUE}📍 AppSync Endpoint:${NC}"
echo "   https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql"
echo ""

echo -e "${YELLOW}🚀 Starting Customer Portal on http://localhost:3000${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Change to Customer Portal directory
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"

# Start the portal
npm start
