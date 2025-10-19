# Seller Sign-Up & Verification Flow

## ✅ Fixed Flow

### Step 1: Sign In Page (`/login`)
- User lands on login page
- Can sign in with existing credentials
- "Create Seller Account" link → redirects to `/signup`

### Step 2: Sign Up Page (`/signup`)
- New sellers fill out:
  - Business Name
  - Email
  - Password (min 8 chars, uppercase, lowercase, numbers)
- Click "Create Account"
- System sends verification email

### Step 3: Email Verification
- User enters 6-digit code from email
- Click "Verify Email"
- Auto sign-in after verification
- Redirects to home page (`/`)

### Step 4: Document Upload Page
- New users (not yet verified) automatically see document upload page
- Must upload:
  - Business Registration Certificate
  - GST/Tax Registration Certificate
  - Business Address Proof
  - Bank Account Details (Cancelled Cheque)
  - ID Proof (Aadhaar/PAN Card)
- Click "Submit Documents"

### Step 5: Verification Pending Page
- After submitting documents, sellers see pending message:
  - "We'll notify you once your verification has been approved or rejected"
- Cannot access dashboard until admin approves
- Options: Contact Support or Sign Out

### Step 6: Approved Access (After Admin Approval)
- Admin approves in admin portal
- Seller gets full access to dashboard
- Can access all features: Products, Orders, Analytics, etc.

## 🔧 Technical Details

### Routing (`main.tsx`)
```
/login   → LoginPage
/signup  → SignUpPage
/        → App (with verification gating)
```

### Verification States (localStorage)
- `documentsSubmitted`: 'true' when docs are uploaded
- `verificationStatus`: 'approved' when admin approves

### App.tsx Logic
1. Check if authenticated
2. If yes, check `documentsSubmitted`
3. If no docs → show document upload only
4. If docs submitted but not approved → show pending page
5. If approved → show full dashboard

## 📝 What Changed

### Before (Broken):
- "Create Seller Account" → went directly to document upload
- No sign-up form
- Confusing UX

### After (Fixed):
- "Create Seller Account" → `/signup` page
- Proper sign-up form with email verification
- Clear step-by-step flow
- Document upload comes AFTER account creation

## 🧪 Testing

### Test New User Flow:
1. Go to http://localhost:5174/login
2. Click "Create Seller Account"
3. Should go to http://localhost:5174/signup
4. Fill in business name, email, password
5. Click "Create Account"
6. Enter verification code from email
7. Should redirect to http://localhost:5174/ (document upload)
8. Upload documents
9. Should see "Verification In Progress" page

### Test Existing User:
1. Go to http://localhost:5174/login
2. Sign in with credentials
3. If verified → see dashboard
4. If not verified → see pending or document upload

## 📦 Files Modified

1. `main.tsx` - Added SignUpPage routing
2. `SignUpPage.tsx` - Updated redirect after verification
3. `LoginPage.tsx` - Already has "Create Seller Account" link

## ✅ Complete Flow Summary

```
Login Page → "Create Account" link
    ↓
Sign Up Page → Enter details
    ↓
Email Verification → Enter code
    ↓
Auto Sign-In → Redirect to home
    ↓
Document Upload Page → Upload docs
    ↓
Verification Pending Page → Wait for approval
    ↓
Admin Approves → Set verificationStatus = 'approved'
    ↓
Full Dashboard Access → All features unlocked
```
