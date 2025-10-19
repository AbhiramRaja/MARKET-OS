# 📧 Email Setup Guide - Gmail App Password

## Current Status
- **Email**: market.os.123@gmail.com
- **Current App Password**: `xuek jrgv hcqw rnmt` (may be expired/revoked)
- **Error**: `535 5.7.8 Username and Password not accepted`

---

## 🔧 How to Fix Gmail Authentication

### Step 1: Generate New App Password
1. **Go to Google Account**: https://myaccount.google.com/apppasswords
2. **Sign in** with: market.os.123@gmail.com
3. Click **"Create new app password"** or select existing one
4. **App name**: Enter "MarketOS Backend" or "Nodemailer"
5. Click **Generate**
6. **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Update Environment Variable
1. Open: `/backend/seller-service/.env`
2. Replace the password line:
   ```env
   GMAIL_APP_PASSWORD=yournewpasswordhere
   ```
   **Important**: Remove ALL spaces from the password!
   
   Example:
   - ❌ Wrong: `abcd efgh ijkl mnop`
   - ✅ Correct: `abcdefghijklmnop`

### Step 3: Restart Backend
```bash
cd ~/Documents/MarketOS_Seller/backend/seller-service
npm run dev
```

---

## 🧪 Test Email Sending

### Quick Test via Terminal
```bash
curl -X POST http://localhost:3001/notifications/seller-verification \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "test_email",
    "businessName": "Test Email Store",
    "email": "test@example.com",
    "documents": [
      {"name": "Business License", "uploaded": true},
      {"name": "Tax ID", "uploaded": true}
    ]
  }'
```

### What to Look For
In your backend terminal, you should see:
- ✅ `📧 Sending verification email...`
- ✅ `✅ Email sent successfully to market.os.123@gmail.com`
- ✅ `📧 Message ID: <some-id@gmail.com>`

If it fails, you'll see:
- ❌ `❌ Email sending failed: [error message]`
- 🔧 Helpful instructions for fixing

---

## 📋 Email Content Preview

The email sent to **market.os.123@gmail.com** includes:

### Subject
`🔔 New Seller: [Business Name] - Verification Required`

### Body Contains
1. **Seller Details**:
   - Business Name
   - Seller ID
   - Email

2. **Documents Submitted** (with checkmarks):
   - Business Registration Certificate
   - GST/Tax Registration Certificate
   - Business Address Proof
   - Bank Account Details
   - ID Proof

3. **Action Buttons**:
   - ✅ APPROVE SELLER (green button)
   - ❌ REJECT SELLER (red button)

4. **Link to Admin Portal**:
   - Direct link to pending verifications page

---

## 🔒 Security Notes

### Why App Passwords?
- Gmail requires **App Passwords** when using third-party apps
- Regular Gmail password won't work with Nodemailer
- 2-Step Verification must be enabled on the account

### Troubleshooting Common Issues

#### Error: "Less secure app access"
- This is deprecated by Google
- Must use App Passwords instead
- Enable 2-Step Verification first

#### Error: "Username and Password not accepted"
- App password is incorrect or expired
- Spaces in password (remove them!)
- 2-Step Verification not enabled

#### Error: "EAUTH - Invalid login"
- Wrong email address
- Wrong app password
- Account locked/suspended

---

## 🎯 Alternative: Use Different Email Provider

If Gmail continues to fail, you can switch to:

### Option 1: Outlook/Hotmail
```typescript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
})
```

### Option 2: SendGrid (Recommended for Production)
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: 'your-sendgrid-api-key'
  }
})
```

### Option 3: AWS SES (Best for AWS infrastructure)
Already have AWS! Can use Simple Email Service

---

## 📝 Current Configuration

### File: `backend/seller-service/.env`
```env
GMAIL_USER=market.os.123@gmail.com
GMAIL_APP_PASSWORD=xuekjrgvhcqwrnmt
```

### File: `backend/seller-service/src/services/emailService.ts`
- ✅ Uses dotenv for secure credentials
- ✅ Auto-removes spaces from password
- ✅ Detailed error logging
- ✅ Returns success/failure status

---

## 🚀 Quick Fix Checklist

- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Sign in with market.os.123@gmail.com
- [ ] Generate new app password
- [ ] Copy password (remove spaces)
- [ ] Update `.env` file: `GMAIL_APP_PASSWORD=newpassword`
- [ ] Restart backend: `npm run dev`
- [ ] Test by submitting documents in seller portal
- [ ] Check backend terminal for success message
- [ ] Check market.os.123@gmail.com inbox

---

**Last Updated**: October 18, 2025  
**Status**: Email re-enabled with better error handling  
**Next Step**: Generate fresh app password to fix authentication
