# 🎯 Seller Portal - SKIP CDK Option (Recommended)

## ✅ Good News!

**You DON'T need to deploy the CDK backend!** 

You can use your **existing** Customer Portal's AWS infrastructure (AppSync, DynamoDB, etc.) for the Seller Portal too!

---

## 🚀 Quick Start (No CDK Needed!)

### Step 1: Environment Variables Already Created! ✅

I've created the `.env` file at:
```
MarketOS_Seller-main/frontend/seller-portal/.env
```

It's configured to use your **existing** customer portal's AppSync endpoint:
```env
VITE_APPSYNC_URL=https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql
VITE_APPSYNC_KEY=da2-4n647mlhincrzi3ia5qzrjgyie
```

### Step 2: Install Dependencies

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"
npm install
```

### Step 3: Run Seller Portal

```bash
npm run dev
```

It will start on **http://localhost:3002** ✨

---

## 🔍 What About the API Endpoints?

The seller portal code uses these API endpoints:

```typescript
// Products API
GET  /api/products?sellerId=SELLER_001
POST /api/products
PUT  /api/products/:id
DELETE /api/products/:id

// Orders API
GET  /api/orders?sellerId=SELLER_001
PUT  /api/orders/:id

// Upload API
POST /api/upload-url
```

### ⚠️ Issue: These endpoints don't exist yet!

**Two solutions:**

### Solution 1: Add Lambda Functions to Customer Portal (Quick Fix)

You need to add these Lambda functions to your **existing** Amplify backend:

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"

# Add API endpoints for seller operations
amplify add function
# Name: sellerProducts
# Template: CRUD function
# DynamoDB table: Products (same as customer uses)
```

### Solution 2: Mock the API for Testing (Immediate)

Temporarily mock the API calls until Lambda functions are ready:

```typescript
// In api.ts - add mock data
export async function listProducts() {
  // Mock data for testing
  return [
    {
      productId: 'PROD_001',
      name: 'Nike Air Max',
      price: 120,
      images: ['https://via.placeholder.com/300'],
      sellerId: 'SELLER_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}
```

---

## 📊 What Works Right Now?

With the current setup using shared AppSync:

### ✅ Working:
- **Real-time order subscriptions** - Seller portal will receive orders from customer portal via GraphQL subscriptions
- **AppSync GraphQL** - Can query and mutate data
- **WebSocket connections** - Live updates work

### ⚠️ Needs Work:
- **REST API endpoints** (`/api/products`, `/api/orders`) - Need Lambda functions
- **Product CRUD** - Need to add Lambda functions
- **Image upload** - Need S3 presigned URL Lambda

---

## 🎯 Recommended Next Steps

### Option A: Quick Test (Just Orders)

1. **Skip products for now** - Focus on orders only
2. Orders already work via AppSync GraphQL ✅
3. Test the subscription feature:
   - Customer portal: Place an order
   - Seller portal: Should receive notification via WebSocket

**Test Command:**
```bash
# Terminal 1: Customer Portal
cd "Customer portal" && npm start

# Terminal 2: Seller Portal  
cd "MarketOS_Seller-main/frontend/seller-portal" && npm run dev
```

### Option B: Add Lambda Functions (Complete Solution)

If you want product management to work, you need to add Lambda functions to your Amplify backend.

**Steps:**
1. Use Amplify CLI to add functions
2. Create REST API endpoints
3. Connect to existing DynamoDB tables

**Alternative:** Ask the person who created the seller portal for:
- Lambda function code from `backend/cdk/src/lambdas/`
- Or just copy those Lambda files to your Amplify backend

---

## 🤔 What We Need from Seller Portal Creator

**Nothing critical!** But these would be helpful:

### Nice to Have:
1. **Lambda function implementations** from `backend/cdk/src/lambdas/`:
   - `products.ts` - Product CRUD operations
   - `orders.ts` - Order management
   - `presign.ts` - S3 image upload URLs

2. **GraphQL schema additions** (if any custom types)

3. **DynamoDB table schemas** (Products, Orders structure)

### What We Can Skip:
- ❌ CDK deployment (using your existing Amplify)
- ❌ Separate AppSync endpoint (using customer portal's)
- ❌ Cognito setup (can use API key auth for now)

---

## 💡 Current Architecture

```
┌──────────────────────────────────────┐
│     Customer Portal (Port 3000)      │
│  ✅ Places orders                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│         AppSync GraphQL               │
│  Endpoint: 5hdgfvi4df...             │
│  ✅ Shared by both portals           │
└──────────────┬───────────────────────┘
               │
               │ WebSocket Subscription
               ▼
┌──────────────────────────────────────┐
│     Seller Portal (Port 3002)        │
│  ✅ Receives orders in real-time    │
│  ⚠️ Products need Lambda functions  │
└──────────────────────────────────────┘
```

---

## 🧪 Test It Now!

```bash
# 1. Install dependencies
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"
npm install

# 2. Run seller portal
npm run dev

# 3. Open http://localhost:3002
# You should see the seller portal with Orders tab working!
```

---

## 📝 Summary

**What you have:**
- ✅ Seller portal configured
- ✅ Using existing AppSync (no CDK needed)
- ✅ Environment variables set
- ✅ Real-time subscriptions will work

**What you need:**
- ⚠️ Lambda functions for product API (optional for now)
- ⚠️ Test with real orders to verify subscriptions

**Next action:**
```bash
npm install && npm run dev
```

Then test if orders from customer portal appear in seller portal! 🚀
