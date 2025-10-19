#!/bin/bash

# 🛑 Stop all MarketOS portals

echo "🛑 Stopping all MarketOS portals..."

# Kill processes by port
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Stopped Customer Portal (3000)"
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "✅ Stopped Driver Portal (3001)"
lsof -ti:3002 | xargs kill -9 2>/dev/null && echo "✅ Stopped Seller Portal (3002)"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ Stopped Admin Portal (5173)"

echo ""
echo "✅ All portals stopped!"
