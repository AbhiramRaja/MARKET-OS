# Verification Testing Guide

## How to Test Different Verification States

The seller verification flow has 3 states:

### 1. New User (No Documents Submitted)
**What you'll see:**
- Only the document upload page is accessible
- No navigation menu to other pages
- Must upload documents to proceed

**To test:**
```javascript
// In browser console:
localStorage.clear()
window.location.reload()
```

### 2. Pending Verification (Documents Submitted)
**What you'll see:**
- "Verification In Progress" page with the message: "We'll notify you once your verification has been approved or rejected"
- Cannot access dashboard or any other pages
- Only options: Contact Support or Sign Out

**To test:**
```javascript
// In browser console:
localStorage.setItem('documentsSubmitted', 'true')
localStorage.removeItem('verificationStatus')
window.location.reload()
```

### 3. Approved Seller (Verification Complete)
**What you'll see:**
- Full access to all pages: Dashboard, Analytics, Products, Orders, etc.
- Complete navigation menu
- All features enabled

**To test:**
```javascript
// In browser console:
localStorage.setItem('documentsSubmitted', 'true')
localStorage.setItem('verificationStatus', 'approved')
window.location.reload()
```

## Quick Test Commands

### Reset to New User:
```javascript
localStorage.clear()
window.location.reload()
```

### Simulate Document Submission:
```javascript
localStorage.setItem('documentsSubmitted', 'true')
window.location.reload()
```

### Approve Verification:
```javascript
localStorage.setItem('verificationStatus', 'approved')
window.location.reload()
```

### Reject Verification (for future):
```javascript
localStorage.setItem('verificationStatus', 'rejected')
window.location.reload()
```

## Admin Flow

1. New seller signs up and lands on document upload page
2. Seller uploads documents → redirected to "Verification Pending" page
3. Admin reviews documents in Admin Portal
4. Admin approves/rejects
5. Seller gets notified via email
6. If approved: Seller can access full dashboard
7. If rejected: Seller sees rejection reason and can re-submit

## Seed Data

The MongoDB sellers in the backend (`backend/seller-service`) don't store verification status by default. The verification is currently managed through localStorage for frontend testing.

For production, you would:
1. Add `verificationStatus` field to Seller schema in MongoDB
2. Check verification status from backend API
3. Store verification in database instead of localStorage

## Current Implementation

- ✅ Document upload page for new users
- ✅ Verification pending page with message
- ✅ Dashboard access gated behind verification
- ✅ Removed "Deactivate Account" from Settings
- ✅ Fixed sign-in redirect (no more double screen)

## Files Modified

1. `App.tsx` - Added verification state checking and conditional rendering
2. `DocumentUpload.tsx` - Added callback for document submission
3. `VerificationPending.tsx` - New page for pending verification state
4. `Settings.tsx` - Removed "Deactivate Account" section
5. `LoginPage.tsx` - Fixed redirect to prevent double screen issue
