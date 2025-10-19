# Backend API Deployment Guide

## 🚀 Quick Deploy to Render.com (FREE - Recommended)

### Step 1: Build the Backend
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/seller-service
npm install
npm run build
```

### Step 2: Deploy to Render

1. **Go to:** https://render.com/
2. **Sign up/Login** (Use GitHub if possible)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repo** or **Deploy from local**

#### Option A: Deploy from GitHub (Recommended)
1. Connect your `MARKET-OS` repository
2. Select the repo
3. Configure:
   - **Name:** `marketos-backend`
   - **Region:** Choose closest to India (Singapore)
   - **Branch:** `feat/main`
   - **Root Directory:** `MarketOS_Seller-main/backend/seller-service`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=<your-access-key>
   AWS_SECRET_ACCESS_KEY=<your-secret-key>
   ```

5. Click **"Create Web Service"**
6. Wait 3-5 minutes for deployment
7. You'll get a URL like: `https://marketos-backend.onrender.com`

#### Option B: Deploy Manually (If no GitHub)
```bash
# Install Render CLI
npm install -g render-cli

# Deploy
cd /Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/seller-service
render deploy
```

---

## 🌐 Alternative: Deploy to Railway.app (Also FREE)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login
```bash
railway login
```

### Step 3: Deploy
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/seller-service
railway init
railway up
```

### Step 4: Set Environment Variables
```bash
railway variables set AWS_REGION=ap-south-1
railway variables set AWS_ACCESS_KEY_ID=<your-key>
railway variables set AWS_SECRET_ACCESS_KEY=<your-secret>
```

### Step 5: Get URL
```bash
railway domain
```

You'll get: `https://marketos-backend.up.railway.app`

---

## 🔧 Update Frontend After Backend Deployed

Once you have your backend URL (e.g., `https://marketos-backend.onrender.com`), update:

### 1. Admin Portal
Edit: `/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal/src/lib/api-client.ts`

Change:
```typescript
const API_BASE = 'http://localhost:3001'
```

To:
```typescript
const API_BASE = 'https://marketos-backend.onrender.com'
```

Then rebuild and redeploy:
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal
npx vite build
netlify deploy --prod --dir=dist
```

### 2. Seller Portal (if it uses the backend)
Check for similar API calls and update them too.

---

## ⚡ FASTEST OPTION: Use Render's Free Tier

**Why Render?**
- ✅ Free tier (750 hours/month)
- ✅ Auto-deploy from GitHub
- ✅ Built-in SSL
- ✅ Easy environment variables
- ✅ No credit card required for free tier

**Deployment Time:** 5 minutes

---

## 🎯 AWS Credentials Needed

The backend needs AWS credentials to access DynamoDB. You can:

1. **Use IAM User Credentials:**
   - Create IAM user with DynamoDB access
   - Generate Access Key ID and Secret Access Key
   - Add to environment variables

2. **Or use IAM Role (if deploying to AWS):**
   - If you deploy to AWS Lambda/ECS, use IAM roles instead

---

## 📊 After Deployment Checklist

✅ Backend deployed and running  
✅ Backend URL obtained (e.g., `https://marketos-backend.onrender.com`)  
✅ Admin Portal API_BASE updated  
✅ Admin Portal rebuilt and redeployed  
✅ Test Admin Portal with live backend  

---

## 🚨 Quick Test Backend

Once deployed, test the API:

```bash
# Replace with your actual backend URL
curl https://marketos-backend.onrender.com/sellers

# Should return JSON array of sellers
```

---

## 💡 Recommended Flow:

1. **Deploy backend to Render.com** (5 min)
2. **Get backend URL**
3. **Update Admin Portal API_BASE** (1 min)
4. **Rebuild Admin Portal** (1 min)
5. **Redeploy Admin Portal** (1 min)
6. **Test!** ✅

Total time: **~10 minutes**

---

**Would you like me to help you deploy to Render or Railway right now?**
