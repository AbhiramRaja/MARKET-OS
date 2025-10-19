#!/bin/bash

# 🚀 MarketOS Complete Demo Launcher
# Starts all portals with proper configuration

echo "🚀 Starting MarketOS Complete Demo..."
echo ""

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# Create logs directory
mkdir -p logs

# Start Customer Portal (Port 3000)
echo "📱 Starting Customer Portal on port 3000..."
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"
BROWSER=none PORT=3000 npm start > ../logs/customer.log 2>&1 &
CUSTOMER_PID=$!
echo "   Customer Portal PID: $CUSTOMER_PID"

# Wait a bit for the first one to start
sleep 3

# Start Driver Portal (Port 3001)
echo "🚗 Starting Driver Portal on port 3001..."
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/marketos-driver"
BROWSER=none PORT=3001 npm start > ../../logs/driver.log 2>&1 &
DRIVER_PID=$!
echo "   Driver Portal PID: $DRIVER_PID"

sleep 3

# Start Seller Portal (Port 3002)
echo "🏪 Starting Seller Portal on port 3002..."
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"
npm run dev > ../../../logs/seller.log 2>&1 &
SELLER_PID=$!
echo "   Seller Portal PID: $SELLER_PID"

sleep 3

# Start Admin Portal (Port 5173)
echo "👨‍💼 Starting Admin Portal on port 5173..."
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal"
npm run dev > ../../../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo "   Admin Portal PID: $ADMIN_PID"

echo ""
echo "⏳ Waiting 15 seconds for all portals to initialize..."
sleep 15

echo ""
echo "✅ All portals started!"
echo ""
echo "🌐 Portal URLs:"
echo "   📱 Customer Portal: http://localhost:3000"
echo "   🚗 Driver Portal:   http://localhost:3001"
echo "   🏪 Seller Portal:   http://localhost:3002"
echo "   👨‍💼 Admin Portal:    http://localhost:5173"
echo ""
echo "📋 Process IDs (for monitoring):"
echo "   Customer: $CUSTOMER_PID"
echo "   Driver:   $DRIVER_PID"
echo "   Seller:   $SELLER_PID"
echo "   Admin:    $ADMIN_PID"
echo ""
echo "📝 Logs are in: logs/ directory"
echo ""
echo "🛑 To stop all portals, run: ./stop-demo.sh"
echo ""
echo "🎬 Demo is READY! Open the URLs above in your browser."
echo ""
