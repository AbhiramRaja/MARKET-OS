#!/bin/bash

# MarketOS - Start All Portals
# This script opens 3 terminal windows and runs each portal

echo "🚀 Starting MarketOS - All Portals"
echo "=================================="
echo ""
echo "Opening 3 terminals:"
echo "  Terminal 1: Customer Portal (port 3000)"
echo "  Terminal 2: Driver Portal (port 3001)"
echo "  Terminal 3: Seller Portal (port 3002)"
echo ""

# Get the workspace directory
WORKSPACE="/Users/abhi/Documents/AWS-HACKATHON"

# Function to open new terminal tab and run command
run_in_new_tab() {
    local title=$1
    local dir=$2
    local cmd=$3
    
    osascript <<EOF
tell application "Terminal"
    do script "cd '$dir' && clear && echo '═══════════════════════════════════════' && echo '  $title' && echo '═══════════════════════════════════════' && echo '' && $cmd"
    activate
end tell
EOF
}

# Start Customer Portal (port 3000)
echo "✅ Starting Customer Portal..."
run_in_new_tab "🛍️  CUSTOMER PORTAL (Port 3000)" \
    "$WORKSPACE/Customer portal" \
    "npm start"

sleep 2

# Start Driver Portal (port 3001)
echo "✅ Starting Driver Portal..."
run_in_new_tab "🚚 DRIVER PORTAL (Port 3001)" \
    "$WORKSPACE/marketos-driver" \
    "npm start"

sleep 2

# Start Seller Portal (port 3002)
echo "✅ Starting Seller Portal..."
run_in_new_tab "🏪 SELLER PORTAL (Port 3002)" \
    "$WORKSPACE/MarketOS_Seller-main/frontend/seller-portal" \
    "npm run dev"

echo ""
echo "✅ All portals starting!"
echo ""
echo "Access URLs:"
echo "  • Customer: http://localhost:3000"
echo "  • Driver:   http://localhost:3001"
echo "  • Seller:   http://localhost:3002"
echo ""
echo "Press Ctrl+C in each terminal window to stop"
