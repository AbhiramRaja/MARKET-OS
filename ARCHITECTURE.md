# MarketOS - Complete Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD INFRASTRUCTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐      ┌──────────────────┐      ┌───────────────┐ │
│  │   AWS Cognito    │      │   AWS AppSync    │      │  DynamoDB     │ │
│  │  (User Pools)    │      │   (GraphQL)      │      │  (Tables)     │ │
│  │                  │      │                  │      │               │ │
│  │ • Customer Pool  │      │ • Queries        │      │ • Orders      │ │
│  │ • Driver Pool    │      │ • Mutations      │      │ • Products    │ │
│  │ • Seller Pool    │      │ • Subscriptions  │      │ • Users       │ │
│  └──────────────────┘      └──────────────────┘      │ • Sellers     │ │
│                                                       │ • Stores      │ │
│  ┌──────────────────┐      ┌──────────────────┐      └───────────────┘ │
│  │  API Gateway     │      │   AWS Lambda     │                         │
│  │  (REST API)      │      │  (Functions)     │      ┌───────────────┐ │
│  │                  │      │                  │      │  Amazon S3    │ │
│  │ /api/products    │◄────►│ • createProduct  │      │  (Storage)    │ │
│  │ /api/orders      │      │ • listProducts   │      │               │ │
│  │ /api/upload-url  │      │ • updateOrder    │      │ • Product     │ │
│  └──────────────────┘      │ • getOrders      │      │   Images      │ │
│                             └──────────────────┘      │ • Documents   │ │
│                                                       └───────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                     │                │                │
         ┌───────────▼──────┐  ┌──────▼───────┐  ┌────▼─────────┐
         │  CUSTOMER PORTAL │  │ DRIVER PORTAL│  │SELLER PORTAL │
         │   Port 3000      │  │  Port 3001   │  │  Port 3002   │
         ├──────────────────┤  ├──────────────┤  ├──────────────┤
         │                  │  │              │  │              │
         │ • Browse Products│  │ • View Deliveries│ • Manage Products│
         │ • Add to Cart    │  │ • Route Map  │  │ • Process Orders │
         │ • Checkout       │  │ • Update Status│ │ • View Analytics│
         │ • Track Orders   │  │ • Navigation │  │ • Inventory   │
         │                  │  │              │  │              │
         │ React + Amplify  │  │React + Amplify│ │React + Vite  │
         │ Context API      │  │  Zustand     │  │ TypeScript   │
         └──────────────────┘  └──────────────┘  └──────────────┘
```

## 🔄 Data Flow Diagrams

### Order Creation Flow

```
[Customer Portal]
      │
      │ 1. Customer places order
      ▼
[GraphQL Mutation: createOrder]
      │
      ▼
[AppSync → DynamoDB]
      │
      │ Order saved with status: PENDING
      │
      ├─────────────────────────────────┐
      │                                 │
      ▼                                 ▼
[Subscription Trigger]          [Subscription Trigger]
      │                                 │
      ▼                                 ▼
[Seller Portal]                   [Driver Portal]
   Receives notification          Receives notification
   Shows in "Orders" tab          Shows in "Available"
```

### Order Status Update Flow

```
[Seller Portal]
      │
      │ 1. Seller clicks "Advance Status"
      │    PENDING → CONFIRMED → OUT_FOR_DELIVERY
      ▼
[GraphQL Mutation: updateOrder]
      │
      ▼
[AppSync → DynamoDB]
      │
      │ Order status updated
      │
      ├─────────────────────────────────┐
      │                                 │
      ▼                                 ▼
[WebSocket Push]                  [WebSocket Push]
      │                                 │
      ▼                                 ▼
[Customer Portal]                 [Driver Portal]
   Order Tracking updates         Delivery status updates
   Real-time progress bar         Route assignments
```

### Product Management Flow

```
[Seller Portal]
      │
      │ 1. Seller creates product
      │    - Name, Price, Images
      ▼
[Upload Image to S3]
      │
      │ 2. Get presigned URL
      ▼
[S3 Bucket: marketos-products]
      │
      │ 3. Image uploaded
      │    Returns: image URL
      ▼
[API: POST /api/products]
      │
      ▼
[Lambda: createProduct]
      │
      ▼
[DynamoDB: Products Table]
      │
      │ Product saved with:
      │ - productId
      │ - sellerId
      │ - name, price
      │ - images: [S3 URL]
      │
      ▼
[Customer Portal Queries]
      │
      ▼
[Product appears in search]
   ✅ Customers can now buy
```

## 🎯 Integration Points

### 1. Shared AppSync Endpoint (Recommended)

```
Customer Portal ──┐
                  ├──► AppSync GraphQL ──► DynamoDB
Seller Portal  ───┤    (Single Source)
                  │
Driver Portal  ───┘
```

**Benefits:**
- ✅ Real-time sync across all portals
- ✅ No data duplication
- ✅ Simpler architecture

**Configuration:**
All portals use the same endpoint:
```
https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql
```

### 2. Separate Backends with Sync (Alternative)

```
Customer Portal ──► AppSync A ──► DynamoDB Orders A
                                        │
                                        │ Lambda Trigger
                                        ▼
Seller Portal  ───► AppSync B ──► DynamoDB Orders B
                                        │
                                        │ Lambda Trigger
                                        ▼
Driver Portal  ───► AppSync C ──► DynamoDB Orders C
```

**Benefits:**
- ✅ Complete isolation
- ✅ Independent scaling

**Drawbacks:**
- ❌ More complex
- ❌ Data sync delays
- ❌ Higher AWS costs

## 📱 Portal Feature Matrix

| Feature | Customer | Driver | Seller |
|---------|----------|--------|--------|
| **Authentication** | ✅ Cognito | ✅ Cognito | 🔄 API Key |
| **Browse Products** | ✅ | ❌ | ✅ (Own) |
| **Create Products** | ❌ | ❌ | ✅ |
| **Place Orders** | ✅ | ❌ | ❌ |
| **View Orders** | ✅ (Own) | ✅ (Assigned) | ✅ (All) |
| **Update Order Status** | ❌ | ✅ | ✅ |
| **Real-time Updates** | ✅ | ✅ | ✅ |
| **Route Navigation** | ❌ | ✅ | ❌ |
| **Inventory Management** | ❌ | ❌ | ✅ |
| **Analytics Dashboard** | ❌ | ❌ | ✅ |
| **Image Upload** | ❌ | ❌ | ✅ |

## 🔐 Security Model

```
┌─────────────────────────────────────────────────┐
│             Customer Portal (Port 3000)          │
├─────────────────────────────────────────────────┤
│ Auth: AWS Cognito User Pool                     │
│ Access: Public (after login)                    │
│ Permissions:                                     │
│   • Read: All products                          │
│   • Write: Own cart, own orders                 │
│   • Subscribe: Own order updates                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              Driver Portal (Port 3001)           │
├─────────────────────────────────────────────────┤
│ Auth: AWS Cognito Driver Pool                   │
│ Access: Drivers only                            │
│ Permissions:                                     │
│   • Read: Assigned deliveries                   │
│   • Write: Order status (delivery phase)        │
│   • Subscribe: New delivery assignments         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              Seller Portal (Port 3002)           │
├─────────────────────────────────────────────────┤
│ Auth: AppSync API Key (upgrade to Cognito)      │
│ Access: Sellers only                            │
│ Permissions:                                     │
│   • Read: Own products, own orders              │
│   • Write: Own products, order status           │
│   • Subscribe: New orders for seller            │
│   • Upload: Product images to S3                │
└─────────────────────────────────────────────────┘
```

## 🚀 Deployment Flow

```
┌─────────────────────────────────────────────────┐
│         STEP 1: Deploy Customer Portal          │
│  amplify init → amplify push                    │
│  Creates: AppSync, Cognito, DynamoDB            │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          STEP 2: Deploy Driver Portal           │
│  Uses same AppSync from Step 1                  │
│  Separate Cognito pool for drivers              │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          STEP 3: Deploy Seller Backend          │
│  cd backend/cdk                                 │
│  npx cdk deploy --all                           │
│  Creates: API Gateway, Lambda, S3, AppSync      │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         STEP 4: Configure Seller Portal         │
│  Update .env with CDK outputs                   │
│  npm install → npm run dev                      │
└─────────────────────────────────────────────────┘
```

## 📊 AWS Resources Created

| Service | Resource | Purpose |
|---------|----------|---------|
| **Cognito** | Customer User Pool | Customer authentication |
| **Cognito** | Driver User Pool | Driver authentication |
| **AppSync** | GraphQL API | Real-time data sync |
| **DynamoDB** | Orders Table | Store orders |
| **DynamoDB** | Products Table | Store products |
| **DynamoDB** | Users Table | Store user profiles |
| **DynamoDB** | Sellers Table | Store seller info |
| **API Gateway** | REST API | Seller APIs |
| **Lambda** | createProduct | Product creation |
| **Lambda** | listProducts | Get products |
| **Lambda** | updateOrder | Update order status |
| **Lambda** | getUploadUrl | S3 presigned URLs |
| **S3** | Products Bucket | Product images |
| **CloudWatch** | Logs | Monitoring |

## 🎯 Success Metrics

```
┌────────────────────────────────────────────────┐
│           ALL SYSTEMS OPERATIONAL              │
├────────────────────────────────────────────────┤
│ ✅ Customer can browse and order              │
│ ✅ Seller receives order instantly            │
│ ✅ Driver gets delivery assignment            │
│ ✅ Status updates sync in real-time           │
│ ✅ Products appear across all portals         │
│ ✅ Images upload to S3 successfully           │
│ ✅ WebSocket connections stable               │
│ ✅ No port conflicts (3000, 3001, 3002)      │
└────────────────────────────────────────────────┘
```

---

**This architecture enables:**
- 🚀 Real-time order processing
- 📦 Multi-vendor marketplace
- 🚚 On-demand delivery
- 📊 Analytics for sellers
- 🔄 Live inventory updates
- 🌐 Scalable cloud infrastructure
