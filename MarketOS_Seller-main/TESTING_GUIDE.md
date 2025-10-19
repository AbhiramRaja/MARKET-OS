# MarketOS Seller - Testing Guide

## 🎯 System Status

✅ **Backend**: Running on http://localhost:3001  
✅ **Seller Portal**: Running on http://localhost:5176/  
✅ **Admin Portal**: Running on http://localhost:5175/  
✅ **Database**: Seeded with 35 sellers, 1225 products, 574 orders

## 🔧 Configuration

**AWS Cognito**:
- User Pool ID: `ap-south-1_d0s99txNQ`
- App Client ID: `ae27uf3rk6k3pqrr04go6c7h4`
- Region: `ap-south-1`

**Admin Credentials**:
- Email: `mmarket.os.123@gmail.com`
- Password: `CodeCrew@1`

---

## 🧪 Testing Scenarios

### Phase 1: Seller Authentication Testing

#### Test 1: New Seller Signup ✅
**URL**: http://localhost:5176/

**Steps**:
1. Click "Sign Up" button
2. Fill in the complete form:
   
   **Business Information**:
   - Business Name: `Tech Galaxy Store`
   - Category: `Electronics`
   - Email: `techgalaxy@example.com`
   - Phone: `+91 9876543210`
   
   **Store Address**:
   - Street Address: `Shop 42, Tech Plaza, MG Road`
   - City: `Mumbai`
   - State: `Maharashtra`
   - Pincode: `400001`
   
   **Tax Information** (Optional):
   - GST Number: `27AABCU9603R1ZM`
   - PAN Number: `AABCU9603R`
   
   **Account Security**:
   - Password: `TechGalaxy@123`

3. Click "Create Account"

**Expected Results**:
- ✅ Account created successfully
- ✅ Receives email with 6-digit verification code
- ✅ Shows "Verify Your Email" page
- ❌ No "User pool client does not exist" error

---

#### Test 2: Email Verification
**URL**: http://localhost:5176/ (after signup)

**Steps**:
1. Check email inbox for verification code
2. Enter the 6-digit code
3. Click "Verify Email"

**Expected Results**:
- ✅ Email verified successfully
- ✅ Auto signs in
- ✅ Creates seller record in DynamoDB with all address fields
- ✅ Redirects to dashboard showing "Pending Verification" page

---

#### Test 3: Duplicate Email Error
**URL**: http://localhost:5176/

**Steps**:
1. Try to sign up again with `techgalaxy@example.com`
2. Use any password

**Expected Results**:
- ❌ Shows error: "An account with this email already exists"
- ❌ Error type: `UsernameExistsException`

---

#### Test 4: Wrong Password Login
**URL**: http://localhost:5176/

**Steps**:
1. Click "Sign In"
2. Email: `techgalaxy@example.com`
3. Password: `WrongPassword123`
4. Click "Sign In"

**Expected Results**:
- ❌ Shows error: "Incorrect username or password"
- ❌ Error type: `NotAuthorizedException`

---

#### Test 5: Successful Login
**URL**: http://localhost:5176/

**Steps**:
1. Click "Sign In"
2. Email: `techgalaxy@example.com`
3. Password: `TechGalaxy@123`
4. Click "Sign In"

**Expected Results**:
- ✅ Login successful
- ✅ Fetches seller data from DynamoDB
- ✅ Shows "Pending Verification" page (since not approved yet)
- ✅ Displays message: "Your account is under review"

---

### Phase 2: Admin Approval Testing

#### Test 6: Admin Login & View New Seller
**URL**: http://localhost:5175/

**Steps**:
1. Login with admin credentials:
   - Email: `mmarket.os.123@gmail.com`
   - Password: `CodeCrew@1`
2. Search for "Tech Galaxy" or "techgalaxy@example.com"
3. Click on the seller card

**Expected Results**:
- ✅ Shows dashboard with 35+ sellers
- ✅ Can find newly registered seller
- ✅ Seller card shows:
  - Business name: Tech Galaxy Store
  - Seller ID: seller_[timestamp]
  - Email: techgalaxy@example.com
  - Location: 📍 Mumbai, Maharashtra
  - Status: PENDING
  - Revenue: ₹0
  - Total Orders: 0

**Detail Page Shows**:
- ✅ Full address: Shop 42, Tech Plaza, MG Road, Mumbai, Maharashtra - 400001
- ✅ Phone: 📞 +91 9876543210
- ✅ Category: Electronics 💻
- ✅ "Approve Seller" button available

---

#### Test 7: Approve New Seller
**URL**: http://localhost:5175/ (SellerDetails page)

**Steps**:
1. On Tech Galaxy Store detail page
2. Click "Approve Seller" button
3. Wait for confirmation

**Expected Results**:
- ✅ Status changes to "Verified"
- ✅ Button changes to "Revoke Access"
- ✅ DynamoDB seller record updated (verified: true)
- ✅ Success message shown

---

#### Test 8: Seller Accesses Dashboard After Approval
**URL**: http://localhost:5176/

**Steps**:
1. Go back to seller portal
2. Refresh the page OR logout and login again
3. Observe the page

**Expected Results**:
- ✅ No longer shows "Pending Verification"
- ✅ Shows full seller dashboard with:
  - Products section
  - Orders section
  - Analytics
  - Add Product button
  - Profile management

---

### Phase 3: Data Verification

#### Test 9: Verify Database Records

**Check Seller in DynamoDB**:
```bash
# Using AWS CLI or DynamoDB console
# Table: marketos_sellers
# Look for: techgalaxy@example.com
```

**Expected Fields**:
- ✅ email: "techgalaxy@example.com"
- ✅ sellerId: "seller_[timestamp]"
- ✅ businessName: "Tech Galaxy Store"
- ✅ phone: "+91 9876543210"
- ✅ category: "Electronics"
- ✅ storeAddress: "Shop 42, Tech Plaza, MG Road"
- ✅ city: "Mumbai"
- ✅ state: "Maharashtra"
- ✅ pincode: "400001"
- ✅ gstNumber: "27AABCU9603R1ZM"
- ✅ panNumber: "AABCU9603R"
- ✅ verified: true (after approval)
- ✅ verificationStatus: "pending" or "verified"
- ✅ documentsSubmitted: false
- ✅ joinedDate: ISO timestamp
- ✅ rating: 0

---

### Phase 4: Existing Sellers (From Seed Data)

#### Test 10: Check Existing Sellers Have Address

**URL**: http://localhost:5175/

**Steps**:
1. Login as admin
2. Click on any of the 35 seeded sellers
3. Check if they have location data

**Expected Results**:
- ⚠️ Seeded sellers may NOT have address fields (only new signups will)
- ✅ All seeded sellers should have:
  - Seller ID (seller_001 to seller_035)
  - Business name
  - Email
  - Category
  - Products (35 each)
  - Orders (10-25 each)
  - Revenue > 0

---

## 🐛 Troubleshooting

### Issue: "User pool client does not exist"
**Solution**: ✅ FIXED
- Restarted seller portal to pick up correct env vars
- Correct Client ID: `ae27uf3rk6k3pqrr04go6c7h4`

### Issue: Email not received
**Solution**:
- Check spam folder
- Wait 2-3 minutes
- AWS SES may be in sandbox mode (only verified emails work)

### Issue: Seller shows ₹0 revenue
**Solution**:
- This is normal for new sellers
- Only seeded sellers have existing orders

### Issue: Cannot see address fields
**Solution**:
- Address fields only appear for new signups after the update
- Seeded sellers don't have address data (seed script needs update)

---

## 📊 Success Metrics

After all tests, you should have:
- ✅ 36 sellers total (35 seeded + 1 new)
- ✅ New seller with complete profile (address, phone, tax info)
- ✅ Admin can approve/reject sellers
- ✅ Approved sellers can access full dashboard
- ✅ Pending sellers see verification message
- ✅ Authentication errors work correctly
- ✅ Location data displayed in admin portal

---

## 🚀 Next Steps

After successful testing:
1. **Add Document Upload**: Allow sellers to upload GST/PAN/License docs
2. **Admin Document Review**: Admin can view and verify documents
3. **Email Notifications**: Send approval/rejection emails
4. **Multi-location Support**: Allow sellers to add multiple store locations
5. **Seller Dashboard**: Complete profile editing for address/contact info
6. **Analytics**: Track seller performance by location

---

## 📝 Test Results Template

Use this to track your testing:

```
[ ] Test 1: New Seller Signup - PASS/FAIL
[ ] Test 2: Email Verification - PASS/FAIL
[ ] Test 3: Duplicate Email Error - PASS/FAIL
[ ] Test 4: Wrong Password Login - PASS/FAIL
[ ] Test 5: Successful Login - PASS/FAIL
[ ] Test 6: Admin Login & View New Seller - PASS/FAIL
[ ] Test 7: Approve New Seller - PASS/FAIL
[ ] Test 8: Seller Accesses Dashboard - PASS/FAIL
[ ] Test 9: Verify Database Records - PASS/FAIL
[ ] Test 10: Check Existing Sellers - PASS/FAIL
```

---

**Happy Testing! 🎉**
