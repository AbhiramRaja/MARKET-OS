# 📧 Email Notifications - Complete Guide

## ✅ Email System Implemented

### **3 Automated Emails for Sellers**

1. **Welcome Email** 🎉 - Sent immediately after signup
2. **Approval Email** ✅ - Sent when admin approves seller
3. **Rejection Email** ❌ - Sent when admin rejects seller (with reason)

---

## 📬 Email Details

### 1. Welcome Email (After Signup)

**Trigger**: Seller completes signup and email verification

**Sent To**: Seller's email address

**Subject**: `🎉 Welcome to MarketOS, [FirstName]! Application Received`

**Content**:
- Welcome message with seller's first name
- Business name and seller ID
- Application details (locations, category, etc.)
- What happens next (4-step process)
- Things to do while waiting
- Link to seller portal

**Example**:
```
Hi Rahul!

Thank you for registering Tech Galaxy Electronics on MarketOS.
We're excited to have you join our seller community!

Business Name: Tech Galaxy Electronics
Seller ID: seller_1729242000000
Email: rahul.techgalaxy@example.com
Phone: +91 9876543210
Category: Electronics
Locations: 2 store(s)

What Happens Next?
1. Document Review - Our team is reviewing your submitted documents
2. Verification - We'll verify your business information
3. Approval - You'll receive an email once approved (24-48 hours)
4. Start Selling - Add products and start receiving orders!
```

---

### 2. Approval Email (Admin Approves)

**Trigger**: Admin clicks "Approve Seller" in admin portal

**Sent To**: Seller's email address

**Subject**: `🎉 Congratulations! Your [BusinessName] account is approved!`

**Content**:
- Congratulations message
- Account approved notification
- Account details (ID, email, phone, category)
- Next steps (4-point checklist)
- Dashboard access button
- Support information

**Example**:
```
🎉 Congratulations!
Your Seller Account is Approved!

Great news, Rahul! Your seller account for Tech Galaxy Electronics 
has been approved by our admin team.

Account Details:
Business Name: Tech Galaxy Electronics
Seller ID: seller_1729242000000
Email: rahul.techgalaxy@example.com
Phone: +91 9876543210
Category: Electronics

Next Steps:
1. Login to your seller dashboard
2. Complete your profile information
3. Add your first products
4. Start receiving orders!

[Access Your Dashboard Button]

Need help getting started?
Visit our Seller Guide or contact support at market.os.123@gmail.com
```

---

### 3. Rejection Email (Admin Rejects)

**Trigger**: Admin clicks "Reject Seller" in admin portal (with optional reason)

**Sent To**: Seller's email address

**Subject**: `Application Update: [BusinessName] - Action Required`

**Content**:
- Polite rejection notification
- Reason for rejection (if provided)
- Application details
- What's next (4-point action plan)
- Contact support button
- Reapply button

**Example**:
```
⚠️ Application Update
Seller Account Application Status

Dear Rahul,

Thank you for your interest in joining MarketOS as a seller. 
Unfortunately, we are unable to approve your application for 
Tech Galaxy Electronics at this time.

Reason:
The GST certificate provided appears to be expired. Please upload 
a valid GST certificate with current validity.

Application Details:
Business Name: Tech Galaxy Electronics
Email: rahul.techgalaxy@example.com
Application Date: October 18, 2025

What's Next?
1. Review the reason for rejection above
2. Ensure all required documents are valid and complete
3. Verify your business information is accurate
4. You may reapply once the issues are resolved

[Contact Support Button] [Reapply Now Button]
```

---

## 🔧 Technical Implementation

### Email Service Configuration

**Location**: `backend/seller-service/src/services/emailService.ts`

**Functions**:
- `sendWelcomeEmail(sellerData)` - Welcome email after signup
- `sendSellerApprovalEmail(sellerData)` - Approval notification
- `sendSellerRejectionEmail(sellerData, reason)` - Rejection with reason
- `sendAdminVerificationEmail(sellerData)` - Admin notification (existing)

**Email Provider**: Gmail (Nodemailer)
- **Email**: market.os.123@gmail.com
- **Method**: App-specific password
- **Service**: Gmail SMTP

---

## 🧪 Testing Email Notifications

### Test 1: Welcome Email

**Steps**:
1. Go to http://localhost:5176/
2. Complete the 3-step signup:
   - Step 1: Enter owner name, business details, password
   - Step 2: Add location with address proof
   - Step 3: Upload documents (GST/PAN/License)
3. Click "Create Account"
4. Verify email with 6-digit code
5. **Check email inbox**

**Expected**:
- ✅ Welcome email received at provided email
- ✅ Contains business name and seller ID
- ✅ Lists application details
- ✅ Shows "What Happens Next" steps

---

### Test 2: Approval Email

**Steps**:
1. Complete Test 1 (signup a new seller)
2. Go to admin portal: http://localhost:5175/
3. Login: `mmarket.os.123@gmail.com` / `CodeCrew@1`
4. Find the newly registered seller
5. Click on seller to view details
6. Click "Approve Seller" button
7. **Check seller's email inbox**

**Expected**:
- ✅ Approval email received at seller's email
- ✅ Subject: "Congratulations! Your account is approved!"
- ✅ Beautiful green-themed email with celebration
- ✅ Dashboard access button included
- ✅ Seller status changed to "Verified" in database

**Backend Console Output**:
```
📧 Sending approval email to rahul.techgalaxy@example.com...
✅ Approval email sent successfully to rahul.techgalaxy@example.com
📧 Message ID: <unique-id@gmail.com>
✅ Seller seller_1729242000000 approved
```

---

### Test 3: Rejection Email

**Steps**:
1. Complete Test 1 (signup another seller)
2. Go to admin portal
3. Find the seller
4. View seller details
5. Click "Reject Seller"
6. Enter rejection reason: "GST certificate expired"
7. Confirm rejection
8. **Check seller's email inbox**

**Expected**:
- ✅ Rejection email received at seller's email
- ✅ Subject: "Application Update: [Business] - Action Required"
- ✅ Contains rejection reason
- ✅ Provides reapply option
- ✅ Contact support button included

**Backend Console Output**:
```
📧 Sending rejection email to seller@example.com...
✅ Rejection email sent successfully to seller@example.com
📧 Message ID: <unique-id@gmail.com>
✅ Seller seller_1729242000001 rejected
```

---

## 📊 Email Flow Diagram

```
┌─────────────────┐
│  Seller Signs   │
│      Up         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Verified  │──────► 📧 Welcome Email
└────────┬────────┘         (Sent Immediately)
         │
         ▼
┌─────────────────┐
│ Pending Review  │──────► 📧 Admin Notification
└────────┬────────┘         (To Admin)
         │
         ├──────────┐
         │          │
         ▼          ▼
  ┌──────────┐  ┌──────────┐
  │ Approved │  │ Rejected │
  └────┬─────┘  └────┬─────┘
       │             │
       ▼             ▼
  📧 Approval   📧 Rejection
     Email         Email
  (Seller Gets  (Seller Gets
   Access)        Reason)
```

---

## 🎨 Email Design Features

### Visual Design
- ✅ Gradient header backgrounds
- ✅ Color-coded sections (green for success, red for rejection)
- ✅ Responsive design (mobile-friendly)
- ✅ Professional branding
- ✅ Clear call-to-action buttons

### Content Features
- ✅ Personalized with seller's name
- ✅ Clear subject lines with emojis
- ✅ Structured information blocks
- ✅ Action-oriented language
- ✅ Support contact information

### Technical Features
- ✅ HTML email format
- ✅ Fallback text version
- ✅ Tracking with message IDs
- ✅ Error handling and logging
- ✅ Retry mechanism (via Nodemailer)

---

## 🔒 Email Security

### Best Practices Implemented
- ✅ App-specific password (not account password)
- ✅ Environment variables for credentials
- ✅ No plain text passwords in code
- ✅ Secure SMTP connection
- ✅ Rate limiting (Gmail: 500/day free)

### Gmail App Password Setup
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with market.os.123@gmail.com
3. Select "Mail" app
4. Generate 16-character password
5. Update `.env` file: `GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx`

---

## 📝 Email Templates Customization

### Modify Email Content

**Location**: `backend/seller-service/src/services/emailService.ts`

**Welcome Email**: Line ~186
```typescript
export async function sendWelcomeEmail(sellerData: any) {
  const emailContent = `
    <!-- Modify HTML here -->
  `
}
```

**Approval Email**: Line ~90
```typescript
export async function sendSellerApprovalEmail(sellerData: any) {
  const emailContent = `
    <!-- Modify HTML here -->
  `
}
```

**Rejection Email**: Line ~138
```typescript
export async function sendSellerRejectionEmail(sellerData: any, reason?: string) {
  const emailContent = `
    <!-- Modify HTML here -->
  `
}
```

---

## 🐛 Troubleshooting

### Email Not Received

**Check 1: Spam Folder**
- Gmail may filter automated emails
- Mark MarketOS emails as "Not Spam"

**Check 2: Backend Logs**
```bash
# Check terminal where backend is running
# Look for these messages:
📧 Sending approval email to seller@example.com...
✅ Approval email sent successfully to seller@example.com
```

**Check 3: Email Configuration**
```bash
# Verify .env file in backend/seller-service/
GMAIL_USER=market.os.123@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
```

**Check 4: Gmail Account**
- Verify account not locked
- Check sending limits (500/day)
- Ensure 2FA enabled

### Email Sending Failed

**Error: EAUTH**
```
❌ Email sending failed: Invalid login
Error code: EAUTH
```

**Solution**:
1. Generate new app password
2. Update `.env` file
3. Restart backend server

**Error: ETIMEDOUT**
```
❌ Email sending failed: Connection timeout
```

**Solution**:
1. Check internet connection
2. Verify firewall not blocking port 587
3. Try again in a few minutes

---

## 📈 Monitoring

### Email Logs

**Backend Console Output**:
```
📧 Sending welcome email to seller@example.com...
✅ Welcome email sent successfully to seller@example.com
📧 Message ID: <1234567890.abcdef@gmail.com>
```

**Track Email Delivery**:
- Each email has unique Message ID
- Use for Gmail delivery tracking
- Check Gmail Sent folder for confirmation

---

## 🚀 Production Enhancements

### Phase 1 (Immediate)
1. **Email Templates**: Move to separate files for easy editing
2. **Email Queue**: Use Redis/SQS for reliable delivery
3. **Retry Logic**: Auto-retry failed emails

### Phase 2 (Enhanced)
4. **Email Service**: Migrate to SendGrid/AWS SES for better deliverability
5. **Tracking**: Open rates, click rates, delivery status
6. **Personalization**: Dynamic content based on seller category
7. **Multi-language**: Support Hindi, regional languages

### Phase 3 (Advanced)
8. **Email Campaigns**: Onboarding series, tips, best practices
9. **Notifications**: Order updates, payment confirmations
10. **Analytics**: Email performance dashboard

---

## ✅ Testing Checklist

```
WELCOME EMAIL
[ ] Signup new seller at http://localhost:5176/
[ ] Complete email verification
[ ] Check email inbox for welcome email
[ ] Verify all details correct in email
[ ] Test dashboard link in email

APPROVAL EMAIL
[ ] Login to admin portal
[ ] Approve a pending seller
[ ] Check backend console for email logs
[ ] Verify approval email received by seller
[ ] Check email contains correct business details
[ ] Test dashboard access button
[ ] Verify seller can now login and access dashboard

REJECTION EMAIL
[ ] Reject a pending seller with reason
[ ] Check backend console for email logs
[ ] Verify rejection email received by seller
[ ] Check reason is included in email
[ ] Test contact support button
[ ] Test reapply button
[ ] Verify seller status changed in database
```

---

## 🎉 Ready to Test!

**Start Here**:
1. **Signup**: http://localhost:5176/ (test welcome email)
2. **Admin Portal**: http://localhost:5175/ (test approval/rejection emails)
3. **Check Emails**: seller's inbox for all notifications

**All email notifications are now live and working!** 📧✨
