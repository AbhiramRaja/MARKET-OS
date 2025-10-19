#!/bin/bash

echo "🧪 Testing Email Functionality..."
echo "================================"
echo ""

# Test the verification endpoint
echo "📤 Sending test verification request..."
RESPONSE=$(curl -s -X POST http://localhost:3001/notifications/seller-verification \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "email_test_seller",
    "businessName": "Email Test Business",
    "email": "emailtest@example.com",
    "documents": [
      {"name": "Business Registration Certificate", "uploaded": true},
      {"name": "GST/Tax Registration Certificate", "uploaded": true},
      {"name": "Business Address Proof", "uploaded": true},
      {"name": "Bank Account Details (Cancelled Cheque)", "uploaded": true},
      {"name": "ID Proof (Aadhaar/PAN Card)", "uploaded": true}
    ]
  }')

echo "📨 Response from server:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if email was sent
if echo "$RESPONSE" | grep -q '"emailSent":true'; then
  echo "✅ SUCCESS! Email was sent!"
  echo ""
  echo "📧 Check your inbox: market.os.123@gmail.com"
  echo "📂 Also check spam/junk folder"
  echo ""
  echo "The email should contain:"
  echo "  - Seller details (Email Test Business)"
  echo "  - 5 documents with ✅ checkmarks"
  echo "  - Green APPROVE button"
  echo "  - Red REJECT button"
else
  echo "❌ Email was NOT sent"
  echo ""
  echo "Check the backend terminal for error messages"
  echo "Look for lines starting with:"
  echo "  📧 Sending verification email..."
  echo "  ❌ Email sending failed:"
  echo "  🔧 FIX: Gmail authentication failed!"
fi

echo ""
echo "================================"
