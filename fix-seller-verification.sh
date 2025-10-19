#!/bin/bash

# 🔧 Quick Fix for Seller Portal - Force Verification Approval

echo "🔧 Setting up Seller Portal with auto-approval..."

# Create a simple test user in localStorage format
cat > /tmp/seller-setup.js << 'EOF'
// Run this in Browser Console (F12) on Seller Portal page

// Clear old data
localStorage.clear();

// Create seller with approved status
const seller = {
  sellerId: 'SELLER-001',
  businessName: 'TechGear Electronics',
  email: 'seller@demo.com',
  documentsSubmitted: true,
  verificationStatus: 'approved'
};

// Save to localStorage
localStorage.setItem('currentSeller', JSON.stringify(seller));
localStorage.setItem('verificationStatus', 'approved');
localStorage.setItem('documentsSubmitted', 'true');
localStorage.setItem('sellerLoggedIn', 'true');

console.log('✅ Seller setup complete!');
console.log('🔄 Reload the page to see the dashboard');

// Auto-reload after 1 second
setTimeout(() => window.location.reload(), 1000);
EOF

echo ""
echo "✅ Setup script created!"
echo ""
echo "📋 Instructions:"
echo ""
echo "1. Open Seller Portal: http://localhost:5173"
echo "2. Press F12 to open Browser Console"
echo "3. Copy and paste this code:"
echo ""
cat /tmp/seller-setup.js
echo ""
echo "4. Press Enter and the page will reload with approved status"
echo ""
echo "OR upload documents normally - they will be auto-approved!"
echo ""
