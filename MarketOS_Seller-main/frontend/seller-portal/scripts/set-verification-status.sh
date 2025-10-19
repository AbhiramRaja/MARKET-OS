#!/bin/bash

# Helper script to manage verification status for testing

echo "🔧 MarketOS Seller Verification Helper"
echo "======================================"
echo ""
echo "This script helps you test the verification flow"
echo ""
echo "Options:"
echo "1. Clear verification (start fresh - new user flow)"
echo "2. Set as pending verification (documents submitted)"
echo "3. Set as approved (full access to dashboard)"
echo ""
read -p "Choose option (1-3): " option

case $option in
  1)
    echo "🗑️  Clearing verification status..."
    # Clear all verification data
    localStorage.removeItem('documentsSubmitted')
    localStorage.removeItem('verificationStatus')
    echo "✅ Cleared! Refresh the page to start as a new user."
    ;;
  2)
    echo "⏳ Setting as pending verification..."
    # Set documents as submitted but not yet verified
    localStorage.setItem('documentsSubmitted', 'true')
    localStorage.removeItem('verificationStatus')
    echo "✅ Set to pending! Refresh to see the verification pending page."
    ;;
  3)
    echo "✅ Setting as approved..."
    # Set as verified seller
    localStorage.setItem('documentsSubmitted', 'true')
    localStorage.setItem('verificationStatus', 'approved')
    echo "✅ Set to approved! Refresh to access the full dashboard."
    ;;
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

echo ""
echo "💡 Tip: Open your browser console and run:"
echo "   To clear: localStorage.clear()"
echo "   To check: console.log(localStorage)"
