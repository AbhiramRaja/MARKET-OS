# 🚀 MarketOS - Multi-Portal Ecosystem

## Overview
MarketOS consists of **THREE separate applications** working together:

1. **Customer Portal** (Port 3000) - Shoppers browse products, place orders, track deliveries
2. **Driver Portal** (Port 3001) - Delivery drivers manage routes and deliveries  
3. **Seller Portal** (Port 3002) - Sellers manage products, fulfill orders, track inventory

---

## 📂 Complete Folder Structure

```
AWS-HACKATHON/
│
├── Customer portal/                        ← 🛍️ CUSTOMER PORTAL
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env                                ← PORT=3000
│
├── marketos-driver/                        ← 🚚 DRIVER PORTAL
│   ├── src/
│   │   ├── pages/DriversPage.jsx
│   │   ├── components/RouteMap.jsx
│   │   └── services/OrderService.js
│   ├── package.json
│   └── .env                                ← PORT=3001
│
└── MarketOS_Seller-main/                   ← 🏪 SELLER PORTAL
    ├── frontend/seller-portal/
    │   ├── src/
    │   │   ├── App.tsx
    │   │   ├── Orders.tsx
    │   │   ├── Products.tsx
    │   │   ├── api.ts
    │   │   └── apollo.ts
    │   ├── package.json
    │   └── .env                            ← PORT=3002
    └── backend/cdk/                        ← AWS Infrastructure (CDK)
```

---

## 🚀 Running All Three Portals

### Prerequisites

1. **Node.js** installed (v18+)
2. **AWS Account** configured
3. **AWS CDK** deployed (for seller portal backend)

### Quick Start - Run All Portals

Open **THREE separate terminal windows**:

#### Terminal 1: Customer Portal
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"
npm install  # First time only
npm start
```
✅ Runs on **http://localhost:3000**

#### Terminal 2: Driver Portal
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/marketos-driver
npm install  # First time only
npm start
```
✅ Runs on **http://localhost:3001**

#### Terminal 3: Seller Portal
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"
npm install  # First time only
npm run dev
```
✅ Runs on **http://localhost:3002**

---

## 🔗 How They Work Together

### Order Flow

```
1. CUSTOMER places order (Port 3000)
   ↓
   Saved to DynamoDB via AppSync
   ↓
2. SELLER receives notification (Port 3002) via GraphQL subscription
   ↓
   Seller updates status: PLACED → CONFIRMED → OUT_FOR_DELIVERY
   ↓
3. DRIVER gets delivery (Port 3001)
   ↓
   Marks as PICKED_UP → IN_TRANSIT → DELIVERED
   ↓
4. CUSTOMER sees real-time updates (Port 3000)
```

### Product Flow

```
1. SELLER creates product (Port 3002)
   ↓
   Uploaded to S3 (images) + DynamoDB (data)
   ↓
2. CUSTOMER sees product (Port 3000)
   ↓
   Searches and browses seller's catalog
```

---

## ⚙️ Configuration Files

### Customer Portal - `.env`
```env
PORT=3000
BROWSER=none
REACT_APP_AWS_REGION=ap-south-1
```

### Driver Portal - `.env`
```env
PORT=3001
BROWSER=none
```

### Seller Portal - `.env`
```env
VITE_PORT=3002
VITE_SELLER_ID=SELLER_001

# API Gateway (from CDK deployment)
VITE_API_BASE=https://xyz.execute-api.ap-south-1.amazonaws.com

# AppSync GraphQL
VITE_APPSYNC_URL=https://abc.appsync-api.ap-south-1.amazonaws.com/graphql
VITE_APPSYNC_KEY=da2-xxxxxxxxxxxxx

# S3 Bucket
VITE_PRODUCTS_BUCKET=marketos-products-bucket
VITE_AWS_REGION=ap-south-1
```

---

## 🛠️ Seller Portal Setup (First Time)

The seller portal requires AWS CDK deployment:

### 1. Deploy Backend Infrastructure

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/cdk"

# Install dependencies
npm install

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy all stacks
npx cdk deploy --all
```

### 2. Copy Output Values

After deployment, you'll see outputs like:

```
✅ MarketOSSellerStack

Outputs:
MarketOSSellerStack.ApiUrl = https://xyz.execute-api.ap-south-1.amazonaws.com
MarketOSSellerStack.AppSyncUrl = https://abc.appsync-api.ap-south-1.amazonaws.com/graphql
MarketOSSellerStack.AppSyncApiKey = da2-xxxxxxxxxxxxx
MarketOSSellerStack.ProductsBucket = marketos-products-xyz
```

### 3. Update Seller Portal `.env`

Copy these values into `MarketOS_Seller-main/frontend/seller-portal/.env`:

```env
VITE_API_BASE=<ApiUrl from output>
VITE_APPSYNC_URL=<AppSyncUrl from output>
VITE_APPSYNC_KEY=<AppSyncApiKey from output>
VITE_PRODUCTS_BUCKET=<ProductsBucket from output>
```

---

## 🧪 Testing the Complete System

### Test 1: Product Creation

1. **Seller Portal** (3002): Create a product
2. **Customer Portal** (3000): Search for the product → Should appear

### Test 2: Order Placement

1. **Customer Portal** (3000): Place an order
2. **Seller Portal** (3002): Check "Orders" tab → New order appears
3. **Seller Portal**: Click "Advance Status"
4. **Driver Portal** (3001): Delivery appears in available deliveries
5. **Customer Portal** (3000): Order tracking updates in real-time

### Test 3: Real-Time Updates

1. Open all 3 portals in separate browser windows
2. Create order in customer portal
3. Watch it appear instantly in seller portal (via WebSocket)
4. Update status in seller portal
5. See update in customer's order tracking

---

## 📊 Tech Stack Comparison

| Feature | Customer Portal | Driver Portal | Seller Portal |
|---------|----------------|---------------|---------------|
| **Framework** | React (CRA) | React (CRA) | React (Vite) |
| **Language** | JavaScript | JavaScript | TypeScript |
| **State** | Context API | Zustand | useState |
| **Backend** | Amplify | Amplify | CDK |
| **API** | AppSync (GraphQL) | AppSync (GraphQL) | API Gateway + AppSync |
| **Database** | DynamoDB | DynamoDB | DynamoDB |
| **Real-time** | AppSync Subscriptions | AppSync Subscriptions | GraphQL Subscriptions |
| **Auth** | Cognito | Cognito | API Key (for now) |
| **Port** | 3000 | 3001 | 3002 |

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -ti:3000 | xargs kill -9  # Customer portal
lsof -ti:3001 | xargs kill -9  # Driver portal  
lsof -ti:3002 | xargs kill -9  # Seller portal
```

### Seller Portal: "Failed to fetch"

1. Check if CDK is deployed: `cd backend/cdk && npx cdk list`
2. Verify `.env` has correct API URLs
3. Check AWS credentials: `aws sts get-caller-identity`

### Real-time Updates Not Working

1. Check WebSocket connection in browser DevTools → Network → WS
2. Verify AppSync subscription in AWS Console
3. Ensure API keys match in both portals

### Customer and Seller Using Different Databases

**Issue**: Orders from customer portal don't appear in seller portal

**Solution**: Both must use the **same** AppSync/DynamoDB endpoint. Update seller's `.env`:

```env
# Use the SAME endpoint as customer portal
VITE_APPSYNC_URL=https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql
VITE_APPSYNC_KEY=da2-4n647mlhincrzi3ia5qzrjgyie
```

---

## 📖 Additional Documentation

- **Seller Portal Setup**: See `SELLER-PORTAL-SETUP.md` for detailed integration guide
- **Customer Portal**: See `Customer portal/README.md`
- **Driver Portal**: See `marketos-driver/INTEGRATION_SUMMARY.md`

---

## 🎯 Quick Commands Reference

```bash
# Start Customer Portal
cd "Customer portal" && npm start

# Start Driver Portal  
cd marketos-driver && npm start

# Start Seller Portal
cd "MarketOS_Seller-main/frontend/seller-portal" && npm run dev

# Deploy Seller Backend
cd "MarketOS_Seller-main/backend/cdk" && npx cdk deploy --all

# Check Running Processes
lsof -i :3000  # Customer
lsof -i :3001  # Driver
lsof -i :3002  # Seller
```

---

## ✅ Success Checklist

- [ ] Customer portal runs on port 3000
- [ ] Driver portal runs on port 3001  
- [ ] Seller portal runs on port 3002
- [ ] CDK backend deployed successfully
- [ ] All portals can run simultaneously
- [ ] Orders flow: Customer → Seller → Driver
- [ ] Real-time updates work across all portals
- [ ] Products created by seller appear in customer search

---

**Need Help?** Check browser console (F12) for errors or see detailed setup guides in each portal's folder.
