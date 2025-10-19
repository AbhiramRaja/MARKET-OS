# 🏪 MarketOS Seller Portal - Setup & Integration Guide

## 📋 Overview

You now have **THREE portals** in your MarketOS ecosystem:

1. **Customer Portal** (port 3000) - `src/` folder - Shoppers browse and order
2. **Driver Portal** (port 3001) - `marketos-driver/` folder - Delivery drivers manage deliveries  
3. **Seller Portal** (port 3002) - `MarketOS_Seller-main/` folder - Sellers manage products & orders

## 🗂️ Current Structure

```
AWS-HACKATHON/
├── src/                              # Customer Portal (React + Amplify)
├── marketos-driver/                  # Driver Portal (React + Amplify)
├── MarketOS_Seller-main/            # Seller Portal (React + Vite + CDK)
│   ├── frontend/seller-portal/      # Frontend app
│   │   ├── src/
│   │   │   ├── App.tsx             # Main app with tabs
│   │   │   ├── Orders.tsx          # Order management + subscriptions
│   │   │   ├── Products.tsx        # Product management
│   │   │   ├── api.ts              # REST API calls
│   │   │   └── apollo.ts           # GraphQL/AppSync client
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── backend/cdk/                # AWS CDK Infrastructure
│       ├── lib/                    # CDK stacks
│       ├── src/                    # Lambda functions
│       └── appsync/                # GraphQL schema
```

## 🚀 Quick Start Guide

### Step 1: Move Seller Portal to Workspace Root (Recommended)

For consistency with your other portals, let's move the seller portal:

```bash
cd /Users/abhi/Documents/AWS-HACKATHON

# Option A: Move the entire folder
mv "MarketOS_Seller-main/frontend/seller-portal" "marketos-seller"

# Option B: Copy (safer)
cp -r "MarketOS_Seller-main/frontend/seller-portal" "marketos-seller"
```

### Step 2: Install Dependencies

```bash
cd marketos-seller
npm install
```

### Step 3: Deploy AWS Backend (CDK)

The seller portal uses AWS CDK for infrastructure. You need to deploy:
- DynamoDB tables (Products, Orders)
- Lambda functions (CRUD operations)
- API Gateway (REST endpoints)
- AppSync (GraphQL + WebSocket subscriptions)
- S3 bucket (product images)

```bash
cd ../MarketOS_Seller-main/backend/cdk

# Install CDK dependencies
npm install

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy all stacks
npx cdk deploy --all
```

**Note the outputs** - you'll need these URLs and API keys!

Example output:
```
✅ MarketOSSellerStack

Outputs:
MarketOSSellerStack.ApiUrl = https://xyz123.execute-api.ap-south-1.amazonaws.com
MarketOSSellerStack.AppSyncUrl = https://abc456.appsync-api.ap-south-1.amazonaws.com/graphql
MarketOSSellerStack.AppSyncApiKey = da2-xxxxxxxxxxxxxxxxxx
MarketOSSellerStack.ProductsBucket = marketos-products-xyz
```

### Step 4: Configure Environment Variables

Create `.env` file in `marketos-seller/`:

```bash
cd ../../../marketos-seller
cat > .env << 'EOF'
# Development port (avoid conflicts with customer:3000 and driver:3001)
VITE_PORT=3002

# Your seller ID (you can use any identifier for testing)
VITE_SELLER_ID=SELLER_001

# API Gateway endpoint (from CDK output)
VITE_API_BASE=https://xyz123.execute-api.ap-south-1.amazonaws.com

# AppSync GraphQL endpoint (from CDK output)
VITE_APPSYNC_URL=https://abc456.appsync-api.ap-south-1.amazonaws.com/graphql

# AppSync API Key (from CDK output)
VITE_APPSYNC_KEY=da2-xxxxxxxxxxxxxxxxxx

# S3 bucket for images (from CDK output)
VITE_PRODUCTS_BUCKET=marketos-products-xyz

# AWS Region
VITE_AWS_REGION=ap-south-1
EOF
```

### Step 5: Update Vite Config for Custom Port

Edit `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    open: false
  }
})
```

### Step 6: Run Seller Portal

```bash
npm run dev
```

The seller portal will start on **http://localhost:3002**

## 🔗 Integration with Customer Portal

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER PORTAL (3000)                    │
│  Customer places order → Creates order in DynamoDB          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ AppSync triggers
                       │ onOrderCreated subscription
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    SELLER PORTAL (3002)                      │
│  ✅ Receives real-time notification                         │
│  ✅ Order appears in Orders tab                             │
│  ✅ Seller updates status (PLACED → CONFIRMED → DELIVERY)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Status update via GraphQL mutation
                       │ Triggers onOrderStatusChange subscription
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    DRIVER PORTAL (3001)                      │
│  Receives delivery assignment                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Integration Points

#### 1. Shared DynamoDB Tables

Both customer and seller portals should use the **same** DynamoDB Orders table.

**Current Setup:**
- Customer Portal: Uses AppSync with `aws-exports.js` (your existing setup)
- Seller Portal: Uses its own DynamoDB table (from CDK)

**Integration Needed:**
You have two options:

**Option A: Merge Tables (Recommended)**
- Update seller portal CDK to use the existing AppSync/DynamoDB from customer portal
- Modify `apollo.ts` to use the same GraphQL endpoint

**Option B: Sync Between Tables**
- Keep separate tables but add Lambda triggers to sync orders
- More complex but maintains separation

#### 2. Product Catalog Sync

Sellers create products in seller portal → Should appear in customer portal search

**Steps:**
1. When seller creates product via seller portal API
2. Product saved to DynamoDB (Products table)
3. Customer portal queries same Products table
4. Add `sellerId` field to link products to sellers

#### 3. Real-Time Order Notifications

**Already implemented in seller portal!** See `Orders.tsx`:

```typescript
const SUB = gql`subscription OnChange($sellerId:String!){
  onOrderStatusChange(sellerId:$sellerId){ orderId sellerId status updatedAt }
}`

// Subscribes to real-time updates
apollo.subscribe({ query: SUB, variables: { sellerId } })
```

## 🧪 Testing the Integration

### Test Scenario 1: Create Product

1. **In Seller Portal (localhost:3002)**:
   - Go to "Products" tab
   - Click "Add Product"
   - Fill in: Name, Price, Upload image
   - Click "Create"

2. **Verify in Customer Portal (localhost:3000)**:
   - Search for the product
   - Should appear in search results with seller's name

### Test Scenario 2: Place Order

1. **In Customer Portal (localhost:3000)**:
   - Add product to cart
   - Checkout
   - Place order

2. **Verify in Seller Portal (localhost:3002)**:
   - Order should appear immediately in "Orders" tab
   - Live Updates section should show the new order
   - Status: `PLACED`

### Test Scenario 3: Update Order Status

1. **In Seller Portal (localhost:3002)**:
   - Click "Advance Status" on an order
   - Status changes: PLACED → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED

2. **Verify in Customer Portal**:
   - Order tracking page should update in real-time
   - Customer sees status change without refresh

## 🔧 Configuration Files

### Customer Portal (`src/aws-exports.js`)
```javascript
const awsmobile = {
  "aws_appsync_graphqlEndpoint": "https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql",
  "aws_appsync_region": "ap-south-1",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-4n647mlhincrzi3ia5qzrjgyie",
  // ... other config
}
```

### Seller Portal (`.env`)
```bash
VITE_APPSYNC_URL=https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql
VITE_APPSYNC_KEY=da2-4n647mlhincrzi3ia5qzrjgyie
```

**⚠️ Important:** For full integration, both should point to the **same AppSync endpoint**!

## 🐛 Troubleshooting

### Issue: Seller portal can't connect to backend

**Solution:**
1. Check if CDK deployed successfully: `cd backend/cdk && npx cdk deploy --all`
2. Verify `.env` has correct URLs from CDK output
3. Check browser console for CORS errors

### Issue: Orders not appearing in seller portal

**Solution:**
1. Verify both portals use same AppSync endpoint
2. Check `sellerId` matches in orders
3. Open Network tab → Check GraphQL subscription connection

### Issue: "Failed to fetch" errors

**Solution:**
1. Check API Gateway URL is correct
2. Verify CORS is enabled on API Gateway
3. Check Lambda function logs in CloudWatch

### Issue: Images not uploading

**Solution:**
1. Verify S3 bucket exists (from CDK output)
2. Check bucket CORS policy allows uploads
3. Ensure presigned URL endpoint works: `POST /api/upload-url`

## 📝 Next Steps

1. **Merge AppSync Endpoints**
   - Use customer portal's AppSync for seller portal too
   - Update seller CDK to add seller-specific GraphQL schema

2. **Add Seller Authentication**
   - Create separate Cognito user pool for sellers
   - Protect seller routes with auth

3. **Enhance Seller Dashboard**
   - Add analytics (revenue, order trends)
   - Product inventory management
   - Store locations (for offline sellers)

4. **Add More Features**
   - Order filtering (by status, date)
   - Product categories
   - Bulk product upload (CSV)
   - Order notifications (email/SMS)

## 🎯 Running All 3 Portals Simultaneously

**Terminal 1: Customer Portal**
```bash
cd /Users/abhi/Documents/AWS-HACKATHON
npm start
# Runs on http://localhost:3000
```

**Terminal 2: Driver Portal**
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/marketos-driver
npm start
# Runs on http://localhost:3001
```

**Terminal 3: Seller Portal**
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/marketos-seller
npm run dev
# Runs on http://localhost:3002
```

## 📊 Tech Stack Summary

| Portal | Framework | State | Backend | Port |
|--------|-----------|-------|---------|------|
| Customer | React + CRA | Context API | Amplify + AppSync | 3000 |
| Driver | React + CRA | Zustand | Amplify + AppSync | 3001 |
| Seller | React + Vite | useState | CDK + AppSync | 3002 |

## 🎉 Success Criteria

- [ ] CDK backend deployed successfully
- [ ] Seller portal runs on port 3002
- [ ] Can create products in seller portal
- [ ] Orders from customer portal appear in seller portal
- [ ] Real-time updates work (AppSync subscriptions)
- [ ] Seller can update order status
- [ ] All 3 portals run simultaneously without conflicts

---

**Need Help?** Check the logs:
- Browser console (F12)
- CloudWatch Logs (Lambda functions)
- AppSync Queries (AWS Console → AppSync → Queries)
