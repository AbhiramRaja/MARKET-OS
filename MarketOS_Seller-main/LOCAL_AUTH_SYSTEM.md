# Local Authentication System

## 🔐 How It Works

### Sign-Up Flow:
1. User enters business name, email, and password
2. System validates password (min 8 chars, uppercase, lowercase, numbers)
3. **Checks if email already exists** in localStorage
4. If exists → Shows error: "Account already exists, please sign in"
5. If new → Creates account and stores in `sellerAccounts` array
6. Auto-login and redirect to document upload

### Sign-In Flow:
1. User enters email and password
2. System tries AWS Cognito first (if available)
3. If AWS fails → Falls back to localStorage
4. **Checks if account exists** in `sellerAccounts` array
5. If not found → Error: "No account found, please create account"
6. If found → **Validates password**
7. If wrong password → Error: "Incorrect password"
8. If correct → Login successful, redirect to home

## 📦 LocalStorage Structure

### Multiple Accounts Support:
```javascript
// All seller accounts stored in array
sellerAccounts: [
  {
    email: "seller1@example.com",
    businessName: "Business 1",
    password: "Password123",  // In production: hash this!
    sellerId: "seller_1729123456",
    createdAt: "2025-10-18T..."
  },
  {
    email: "seller2@example.com",
    businessName: "Business 2",
    password: "SecurePass1",
    sellerId: "seller_1729123457",
    createdAt: "2025-10-18T..."
  }
]

// Current logged-in seller
currentSeller: {
  email: "seller1@example.com",
  businessName: "Business 1",
  sellerId: "seller_1729123456",
  ...
}

// Login state
sellerLoggedIn: "true"
sellerEmail: "seller1@example.com"

// Verification state
documentsSubmitted: "true"
verificationStatus: "approved" | "pending" | "rejected"
```

## 🧪 Testing

### Test 1: Create Account
```
1. Go to /signup
2. Enter: Business Name, Email, Password
3. Click "Create Account"
4. ✅ Should create account and redirect to document upload
5. ✅ Should be logged in automatically
```

### Test 2: Duplicate Account
```
1. Try to create account with same email
2. ❌ Should show: "Account already exists, please sign in"
```

### Test 3: Sign In - Account Doesn't Exist
```
1. Go to /login
2. Enter email that doesn't exist
3. ❌ Should show: "No account found, please create account"
```

### Test 4: Sign In - Wrong Password
```
1. Go to /login
2. Enter correct email but wrong password
3. ❌ Should show: "Incorrect password"
```

### Test 5: Sign In - Success
```
1. Go to /login
2. Enter correct email and password
3. ✅ Should login and redirect to home/dashboard
```

### Test 6: Multiple Sellers
```
1. Create account as seller1@example.com
2. Sign out
3. Create account as seller2@example.com
4. Sign out
5. Sign in as seller1@example.com
6. ✅ Should work - each seller has their own account
```

## 🔄 Sign Out Behavior
```javascript
// When user signs out:
1. localStorage.clear() - Clears all data
2. sessionStorage.clear() - Clears session
3. Redirect to /login

// When user accesses app without login:
1. Check sellerLoggedIn === 'true'
2. If false → Redirect to /login
3. If true → Load seller data and show appropriate page
```

## 🚀 Features

✅ **Multiple Sellers** - Each can create their own account
✅ **Account Validation** - Checks if email already exists
✅ **Authentication** - Only logged-in sellers can access
✅ **Password Validation** - Strong password requirements
✅ **Sign-in Validation** - Only works if account exists
✅ **Session Management** - Tracks logged-in state
✅ **AWS Fallback** - Tries Cognito first, falls back to localStorage

## ⚠️ Security Notes (For Production)

Current implementation is for **development only**. For production:

1. **Hash Passwords** - Never store plain text passwords
   ```javascript
   // Use bcrypt or similar
   const hashedPassword = await bcrypt.hash(password, 10)
   ```

2. **Backend Storage** - Move from localStorage to database
   ```javascript
   // Store in MongoDB/PostgreSQL
   POST /api/auth/signup
   POST /api/auth/signin
   ```

3. **JWT Tokens** - Use proper authentication tokens
   ```javascript
   // Return JWT on successful login
   const token = jwt.sign({ email, sellerId }, SECRET_KEY)
   ```

4. **Secure Session** - Use httpOnly cookies
   ```javascript
   res.cookie('token', token, { httpOnly: true, secure: true })
   ```

## 📝 Files Modified

1. **LoginPage.tsx** - Added localStorage authentication fallback
2. **SignUpPage.tsx** - Stores accounts in array, checks for duplicates
3. **App.tsx** - Checks login state, loads current seller data
4. **main.tsx** - Routes to login if not authenticated

## 🎯 User Experience

**New User:**
Login → "Create Account" → Sign Up Form → Document Upload → Pending → Dashboard

**Existing User:**
Login → Enter Credentials → Dashboard (if verified) or Pending (if not)

**Wrong Credentials:**
Login → Enter Wrong Email/Password → Clear Error Message → Try Again
