# Multi-Step Seller Signup - Testing Guide

## 🎯 New Features

### ✅ **3-Step Signup Process**

**Step 1: Owner & Business Details**
- Owner's First Name & Last Name
- Business Name
- Phone Number
- Category Selection (Electronics, Fashion, etc.)
- Email Address
- Password & Confirm Password validation

**Step 2: Store Locations**
- Add multiple store locations with **+ Add Location** button
- Each location requires:
  - Street Address
  - City, State, Pincode
  - Address Proof Upload (Image/PDF)
- Remove locations (minimum 1 required)
- Visual confirmation when documents uploaded

**Step 3: Document Verification**
- GST Certificate (Number + Upload)
- PAN Card (Number + Upload)
- Business License Upload
- At least ONE document required

---

## 🧪 Test Scenarios

### Test 1: Complete Signup Flow ✅

**URL**: http://localhost:5176/

#### Step 1: Owner & Business Details
1. Fill in:
   - First Name: `Rahul`
   - Last Name: `Sharma`
   - Business Name: `Tech Galaxy Store`
   - Phone: `+91 9876543210`
   - Category: `Electronics`
   - Email: `rahul.techgalaxy@example.com`
   - Password: `TechGalaxy@123`
   - Confirm Password: `TechGalaxy@123`
2. Click **Next →**

**Expected**: 
- ✅ Moves to Step 2
- ✅ Progress indicator shows step 2 active
- ❌ Cannot proceed if passwords don't match
- ❌ Cannot proceed if email invalid

#### Step 2: Store Locations
1. Fill in Location 1:
   - Address: `Shop 42, Tech Plaza, MG Road`
   - City: `Mumbai`
   - State: `Maharashtra`
   - Pincode: `400001`
   - Upload address proof: Click **Choose File** → Select image/PDF
2. Click **+ Add Location**
3. Fill in Location 2:
   - Address: `Unit 15, Commercial Complex, Link Road`
   - City: `Navi Mumbai`
   - State: `Maharashtra`
   - Pincode: `400614`
   - Upload address proof
4. Click **Next →**

**Expected**:
- ✅ Can add multiple locations
- ✅ Shows "✓ Document uploaded successfully" after upload
- ✅ Can remove locations (✕ Remove button)
- ❌ Cannot proceed without uploading address proof
- ❌ Cannot proceed with invalid pincode (must be 6 digits)

#### Step 3: Document Verification
1. GST Section:
   - GST Number: `27AABCU9603R1ZM`
   - Upload GST Certificate (image/PDF)
2. PAN Section:
   - PAN Number: `AABCU9603R`
   - Upload PAN Card (image/PDF)
3. Business License:
   - Upload Business License (image/PDF)
4. Click **Create Account 🚀**

**Expected**:
- ✅ Shows "✓ Document uploaded" for each upload
- ✅ Validation: At least 1 document required
- ✅ Creates Cognito account
- ✅ Shows email verification page

---

### Test 2: Navigation & Validation

**Previous Button**: 
- ✅ Step 2 → Step 1 (data persists)
- ✅ Step 3 → Step 2 (data persists)

**Step Validation**:
- **Step 1**: All fields required except none are optional
- **Step 2**: All address fields + proof required for each location
- **Step 3**: At least 1 document (GST/PAN/License)

**Error Messages**:
- Empty first name: "❌ Please enter your first name"
- Password mismatch: "❌ Passwords do not match"
- Missing address proof: "❌ Please upload address proof for location 1"
- No documents: "❌ Please provide at least one business document"

---

### Test 3: Email Verification (After Signup)

**After successful signup**:
1. Check email for 6-digit code
2. Enter code in verification page
3. Click **Verify Email**

**Expected**:
- ✅ Cognito account verified
- ✅ Seller record created in DynamoDB with:
  - Owner name (first + last)
  - Multiple locations array
  - Documents URLs
- ✅ Redirects to "Pending Verification" page

---

## 📊 DynamoDB Seller Record Structure

```json
{
  "email": "rahul.techgalaxy@example.com",
  "sellerId": "seller_1729242000000",
  "ownerFirstName": "Rahul",
  "ownerLastName": "Sharma",
  "businessName": "Tech Galaxy Store",
  "phone": "+91 9876543210",
  "category": "Electronics",
  "locations": [
    {
      "address": "Shop 42, Tech Plaza, MG Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "addressProofUrl": "data:image/..." // In production: S3 URL
    },
    {
      "address": "Unit 15, Commercial Complex, Link Road",
      "city": "Navi Mumbai",
      "state": "Maharashtra",
      "pincode": "400614",
      "addressProofUrl": "data:image/..." // In production: S3 URL
    }
  ],
  "gstNumber": "27AABCU9603R1ZM",
  "panNumber": "AABCU9603R",
  "documents": {
    "gstUrl": "data:image/...", // In production: S3 URL
    "panUrl": "data:image/...",
    "licenseUrl": "data:image/..."
  },
  "verified": false,
  "verificationStatus": "pending",
  "documentsSubmitted": true,
  "joinedDate": "2025-10-18T10:00:00.000Z",
  "rating": 0
}
```

---

## 🎨 UI Features

### Progress Indicator
- 3 numbered circles with step names
- Active step highlighted in green
- Previous steps remain green
- Future steps in gray

### Location Management
- **+ Add Location** button (top right)
- **✕ Remove** button for each location (except first)
- Each location in separate card with border
- Upload confirmation: Green checkmark with message

### Document Upload
- Three separate sections for GST, PAN, License
- File input with styled button
- Accepts: `image/*` and `application/pdf`
- Upload confirmation for each document

### Validation Feedback
- Error messages in red box at top
- Inline validation hints (password requirements)
- Step-by-step validation (can't skip incomplete steps)

---

## 🚀 Next Steps After Testing

1. **File Upload to S3**:
   - Replace base64 preview with actual S3 upload
   - Use presigned URLs for security
   - Store S3 URLs in DynamoDB

2. **Admin Document Review**:
   - Admin portal shows uploaded documents
   - View documents in modal/new tab
   - Approve/reject with comments

3. **Email Notifications**:
   - Send welcome email after signup
   - Notify admin of new seller registration
   - Notify seller when approved/rejected

4. **Enhanced Validation**:
   - GST number format validation
   - PAN number format validation
   - Phone number format validation
   - Duplicate business name check

5. **Edit Functionality**:
   - Allow sellers to update locations
   - Add/remove locations after signup
   - Re-upload documents if rejected

---

## ✅ Test Checklist

```
Step 1: Owner & Business Details
[ ] First & last name validation
[ ] Email format validation
[ ] Phone number validation
[ ] Password requirements check
[ ] Password match validation
[ ] Category selection works
[ ] "Next" button moves to Step 2

Step 2: Store Locations
[ ] Add multiple locations
[ ] Remove locations (keep minimum 1)
[ ] Address fields validation
[ ] Pincode 6-digit validation
[ ] Address proof upload works
[ ] Upload confirmation shown
[ ] "Previous" button returns to Step 1
[ ] "Next" button moves to Step 3

Step 3: Document Verification
[ ] GST number input works
[ ] PAN number input works
[ ] GST certificate upload
[ ] PAN card upload
[ ] Business license upload
[ ] Upload confirmations shown
[ ] At least 1 document required
[ ] "Previous" button returns to Step 2
[ ] "Create Account" button works

Email Verification
[ ] Cognito account created
[ ] Email sent with code
[ ] Code verification works
[ ] Seller record in DynamoDB
[ ] All data saved correctly
[ ] Redirects to dashboard

Admin Portal
[ ] New seller visible
[ ] Shows owner name
[ ] Shows all locations
[ ] Can view documents
[ ] Can approve seller
```

---

**Ready to test! 🎉**

Visit: http://localhost:5176/
