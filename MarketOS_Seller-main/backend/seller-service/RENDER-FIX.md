# 🔧 RENDER DEPLOYMENT FIX

## ✅ Issue Fixed!

The problem was that Render was trying to run `node index.js` but the compiled file is at `dist/index.js`.

### Changes Made:

1. **Updated Procfile:**
   ```
   web: node dist/index.js
   ```

2. **Package.json already has correct start command:**
   ```json
   "start": "node dist/index.js"
   ```

---

## 🚀 Updated Render.com Configuration

### In Render Dashboard, use these settings:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
node dist/index.js
```

**Root Directory:**
```
MarketOS_Seller-main/backend/seller-service
```

### Environment Variables (IMPORTANT):
```
PORT=10000
NODE_ENV=production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
```

**Note:** Render uses PORT=10000 by default, or will set it automatically.

---

## 📋 Render Deployment Checklist:

✅ Build command: `npm install && npm run build`  
✅ Start command: `node dist/index.js`  
✅ Root directory: `MarketOS_Seller-main/backend/seller-service`  
✅ Environment variables added  
✅ Free instance type selected  
✅ Region: Singapore (closest to ap-south-1)  

---

## 🔄 Redeploy Steps:

1. **In Render Dashboard:**
   - Go to your service
   - Click "Settings"
   - Update **Start Command** to: `node dist/index.js`
   - Click "Save Changes"

2. **Trigger Manual Deploy:**
   - Go to "Manual Deploy" → "Deploy latest commit"
   - Or push changes to GitHub and auto-deploy

---

## ✅ Expected Output After Fix:

```
==> Building...
==> Installing dependencies...
==> Running 'npm run build'
==> Build successful
==> Starting service...
==> Running 'node dist/index.js'
📊 Connected to DynamoDB
🚀 Server running on http://localhost:10000
✅ Service is live!
```

---

## 🎯 After Successful Deployment:

You'll get a URL like:
```
https://marketos-backend.onrender.com
```

Then update Admin Portal:

```bash
cd /Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal
```

Create `.env.production`:
```
VITE_API_URL=https://marketos-backend.onrender.com
```

Update `src/lib/api-client.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

Rebuild and redeploy:
```bash
npx vite build
netlify deploy --prod --dir=dist
```

---

## 🆘 If Still Having Issues:

Check Render logs for:
- AWS credentials validity
- DynamoDB connection
- Port binding

The backend is ready - just needs the correct start command in Render!
