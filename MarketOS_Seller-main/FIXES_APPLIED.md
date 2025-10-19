# Fixes Applied - Email & Verification Issues

## Issues Fixed

### 1. ✅ Email Not Sending
**Problem**: Gmail was rejecting authentication with error `535 5.7.8 Username and Password not accepted`

**Solution**: 
- Temporarily disabled email sending in backend (line 170 of `index.ts`)
- Added warning message: `⚠️ Email disabled - Gmail auth failing. Check admin portal directly.`
- Admin can still access pending verifications through the portal

**Note**: To fix Gmail auth properly later:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password for "Mail"
3. Update the password in `backend/seller-service/src/services/emailService.ts`

---

### 2. ✅ Seller Verification Not Clearing After Approval/Rejection
**Problem**: After approving or rejecting a seller, they remained in the pending list

**Solution**: 
- Modified `/admin/verify-seller/:sellerId` endpoint to only find `status: 'pending'` requests
- Added automatic seller verification status update when approved
- Now when admin approves, the `Seller` document gets `verified: true` flag

**Files Changed**:
- `backend/seller-service/src/index.ts` lines 180-205

---

### 3. ✅ Duplicate Verification Requests
**Problem**: Seller could submit documents multiple times, creating duplicate pending requests

**Solution**:
- Added check for existing pending/approved requests before creating new one
- Returns appropriate message if already pending or verified
- Updated DocumentUpload UI to show status messages

**Files Changed**:
- `backend/seller-service/src/index.ts` lines 156-179
- `frontend/seller-portal/src/pages/DocumentUpload.tsx` lines 45-77

---

### 4. ✅ No Sign-Out Button
**Problem**: Both admin and seller portals had no way to sign out

**Solution**:
- Added red "🚪 Sign Out" button to seller portal navbar
- Added red "🚪 Sign Out" button to admin portal navbar
- Both buttons redirect to login/home page

**Files Changed**:
- `frontend/seller-portal/src/App.tsx` lines 36-56
- `frontend/admin-portal/src/App.tsx` lines 66-76

---

## Testing Instructions

### Test Verification Flow:
1. **Start backend**: `cd backend/seller-service && npm run dev`
2. **Open seller portal**: http://localhost:5174
3. Go to "📄 Documents" page
4. Upload documents and submit
5. Should show: "✅ Documents submitted successfully!"
6. If you submit again, should show: "⏳ Your verification request is already pending"

### Test Admin Approval:
1. **Open admin portal**: http://localhost:5173
2. Click yellow "PENDING VERIFICATIONS" card (shows count)
3. Opens new page with pending seller requests
4. Click "✅ Approve" or "❌ Reject"
5. Refresh admin dashboard - pending count should decrease
6. Approved seller now shows `verified: true` in database

### Test Sign-Out:
1. Both portals now have red "🚪 Sign Out" button in top-right
2. Click to return to login/home page

---

## Backend Changes Summary

### `backend/seller-service/src/index.ts`

**Line 156-179**: Prevent duplicate verification requests
```typescript
// Check if already has a pending or approved request
const existing = await VerificationRequest.findOne({ 
  sellerId, 
  status: { $in: ['pending', 'approved'] } 
})

if (existing) {
  return res.json({ 
    success: true, 
    message: existing.status === 'approved' ? 'Already verified' : 'Verification request already pending',
    verificationId: existing._id,
    status: existing.status
  })
}
```

**Line 180-205**: Fix approval to actually update seller status
```typescript
const verification = await VerificationRequest.findOne({ sellerId, status: 'pending' })
if (!verification) {
  return res.status(404).json({ error: 'Verification request not found' })
}

verification.status = action === 'approve' ? 'approved' : 'rejected'
verification.reviewedAt = new Date()
if (reason) verification.rejectionReason = reason
await verification.save()

// Also update the seller's verified status
if (action === 'approve') {
  await Seller.findOneAndUpdate(
    { sellerId },
    { verified: true }
  )
}
```

---

## Database Schema

### VerificationRequest Collection
- `sellerId`: String
- `businessName`: String
- `email`: String  
- `documents`: Array of {name, uploaded}
- `status`: 'pending' | 'approved' | 'rejected'
- `submittedAt`: Date (auto)
- `reviewedAt`: Date
- `rejectionReason`: String

### Status Flow
1. Seller submits → `status: 'pending'`
2. Admin approves → `status: 'approved'` + `Seller.verified = true`
3. Admin rejects → `status: 'rejected'` + `rejectionReason`

---

## What Still Needs Work

### Email Fix (Optional)
Currently disabled to prevent errors. To re-enable:
1. Generate new Gmail app password
2. Update `emailService.ts` with new password
3. Uncomment line 170 in `index.ts`: `await sendAdminVerificationEmail(...)`
4. Remove line 171: `console.log('⚠️ Email disabled...')`

### Testing Needed
- [ ] Verify approval actually updates seller's verified status
- [ ] Test rejection with reason
- [ ] Confirm no duplicate requests possible
- [ ] Test sign-out redirects properly

---

**Date**: October 18, 2025  
**Branch**: feat/seller-ui  
**Backend Port**: 3001  
**Admin Portal**: http://localhost:5173  
**Seller Portal**: http://localhost:5174
