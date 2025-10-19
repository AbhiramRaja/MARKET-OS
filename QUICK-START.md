# 🚀 MarketOS - Quick Start Guide

## ⚡ TL;DR - Get Everything Running

```bash
# 1. Deploy Seller Backend (ONE TIME ONLY)
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/cdk"
npm install
npx cdk bootstrap
npx cdk deploy --all
# ⚠️ SAVE THE OUTPUT VALUES!

# 2. Configure Seller Portal
cd ../frontend/seller-portal
cat > .env << 'EOF'
VITE_PORT=3002
VITE_SELLER_ID=SELLER_001
VITE_API_BASE=<YOUR_API_URL_FROM_CDK>
VITE_APPSYNC_URL=<YOUR_APPSYNC_URL_FROM_CDK>
VITE_APPSYNC_KEY=<YOUR_API_KEY_FROM_CDK>
EOF

npm install

# 3. Run All Portals (Use convenience script!)
cd /Users/abhi/Documents/AWS-HACKATHON
./start-all-portals.sh
```

---

## 📁 Files I Created for You

| File | Purpose |
|------|---------|
| `SELLER-PORTAL-SETUP.md` | Complete setup guide with troubleshooting |
| `README-ALL-PORTALS.md` | Overview of all 3 portals |
| `INTEGRATION-SUMMARY.md` | What we did + next steps |
| `ARCHITECTURE.md` | Visual diagrams and data flows |
| `start-all-portals.sh` | Launch all portals with one command |

---

## 🎯 Your Three Portals

```
┌─────────────────────────────────────────────────────┐
│  CUSTOMER PORTAL - http://localhost:3000            │
│  Location: Customer portal/                         │
│  Start: npm start                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  DRIVER PORTAL - http://localhost:3001              │
│  Location: marketos-driver/                         │
│  Start: npm start                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  SELLER PORTAL - http://localhost:3002              │
│  Location: MarketOS_Seller-main/frontend/seller-portal/ │
│  Start: npm run dev                                 │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Setup Checklist

### First Time Setup

- [ ] **Deploy CDK Backend** (15 minutes)
  ```bash
  cd "MarketOS_Seller-main/backend/cdk"
  npm install && npx cdk bootstrap && npx cdk deploy --all
  ```

- [ ] **Save CDK Outputs** - Copy these values:
  - [ ] ApiUrl
  - [ ] AppSyncUrl
  - [ ] AppSyncApiKey
  - [ ] ProductsBucket

- [ ] **Configure Seller .env** - Add CDK values to `.env`

- [ ] **Install Dependencies**
  ```bash
  cd "MarketOS_Seller-main/frontend/seller-portal"
  npm install
  ```

### Every Time You Code

- [ ] **Start All Portals**
  ```bash
  ./start-all-portals.sh
  ```

OR manually in 3 terminals:

- [ ] **Terminal 1:** `cd "Customer portal" && npm start`
- [ ] **Terminal 2:** `cd marketos-driver && npm start`
- [ ] **Terminal 3:** `cd "MarketOS_Seller-main/frontend/seller-portal" && npm run dev`

---

## 🧪 Test Your Setup

### Test 1: All Portals Running
```bash
# Run this after starting all portals
curl http://localhost:3000  # Should return HTML
curl http://localhost:3001  # Should return HTML
curl http://localhost:3002  # Should return HTML
```

### Test 2: Create Product (Seller Portal)
1. Open http://localhost:3002
2. Click "Products" tab
3. Add a product with image
4. ✅ Success if product appears in list

### Test 3: Order Flow (All Portals)
1. **Customer (3000):** Place an order
2. **Seller (3002):** Check "Orders" tab → Order appears
3. **Seller:** Click "Advance Status"
4. **Customer (3000):** Track order → Status updated
5. ✅ Success if real-time updates work

---

## 🐛 Quick Troubleshooting

### Problem: Port already in use
```bash
# Kill all Node processes
killall -9 node

# Or kill specific ports
lsof -ti:3000 | xargs kill -9  # Customer
lsof -ti:3001 | xargs kill -9  # Driver
lsof -ti:3002 | xargs kill -9  # Seller
```

### Problem: CDK deploy fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# If not configured
aws configure
```

### Problem: Seller portal won't start
```bash
cd "MarketOS_Seller-main/frontend/seller-portal"
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: Orders don't sync between portals
**Solution:** Use same AppSync endpoint in seller `.env`:
```env
VITE_APPSYNC_URL=https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql
VITE_APPSYNC_KEY=da2-4n647mlhincrzi3ia5qzrjgyie
```

---

## 📞 Need Help?

1. **Check browser console** (F12) for errors
2. **Read detailed guides:**
   - `SELLER-PORTAL-SETUP.md` - Step-by-step setup
   - `README-ALL-PORTALS.md` - Portal overview
   - `ARCHITECTURE.md` - System design
3. **Check logs:**
   - Browser DevTools → Console
   - Terminal output
   - AWS CloudWatch (for backend errors)

---

## 🎉 Success Looks Like

```
✅ Terminal 1: Customer Portal running on port 3000
✅ Terminal 2: Driver Portal running on port 3001
✅ Terminal 3: Seller Portal running on port 3002
✅ No errors in browser console
✅ Products appear in customer search
✅ Orders flow: Customer → Seller → Driver
✅ Real-time updates work across portals
```

---

## 📝 Common Commands

```bash
# Start all portals (ONE COMMAND!)
./start-all-portals.sh

# Deploy backend
cd "MarketOS_Seller-main/backend/cdk" && npx cdk deploy --all

# Check what's running
lsof -i :3000 :3001 :3002

# View CDK stacks
cd "MarketOS_Seller-main/backend/cdk" && npx cdk list

# Destroy CDK resources (careful!)
npx cdk destroy --all
```

---

## 🚀 Next Steps After Setup

1. **Add Seller Authentication**
   - Create Cognito user pool for sellers
   - Replace API key with proper auth

2. **Enhance Seller Dashboard**
   - Add analytics charts
   - Sales reports
   - Inventory tracking

3. **Add More Features**
   - Product categories
   - Bulk product upload
   - Order notifications (email/SMS)
   - Store locations (for offline sellers)

---

**You're all set! 🎉 Run `./start-all-portals.sh` and start building!**
