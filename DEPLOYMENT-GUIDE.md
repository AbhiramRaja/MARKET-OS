# 🚀 COMPLETE DEPLOYMENT GUIDE - MarketOS to Internet

## 🎯 Deployment Strategy

We'll deploy all 4 portals to get working internet links:

1. **Customer Portal** → AWS Amplify Hosting
2. **Driver Portal** → AWS Amplify Hosting (separate app)
3. **Seller Portal** → AWS Amplify Hosting (separate app)
4. **Admin Portal** → AWS Amplify Hosting (separate app)
5. **Backend Service** → AWS Lambda + API Gateway (or EC2)

---

## 📋 STEP 1: Deploy Customer Portal (Main)

### **Current Status:**
- ✅ Already has Amplify configured
- ✅ GraphQL endpoint deployed
- ✅ Auth configured

### **Deploy Now:**

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"

# Build the app
npm run build

# Add hosting
amplify add hosting

# Choose:
# ? Select the plugin module to execute: Hosting with Amplify Console
# ? Choose a type: Manual deployment

# Publish
amplify publish
```

**Expected Output:**
```
✔ Deployment complete!
https://dev.xxxxx.amplifyapp.com
```

---

## 📋 STEP 2: Deploy Driver Portal

### **Option A: Amplify CLI (Recommended)**

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/marketos-driver"

# Initialize Amplify for this app
amplify init

# Choose:
# ? Enter a name for the project: marketosdriver
# ? Initialize the project with the above configuration? Yes
# ? Select the authentication method: AWS profile
# ? Please choose the profile you want to use: default

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### **Option B: Netlify (Faster)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/marketos-driver"
npm run build

# Deploy
netlify deploy --prod
```

**You'll get:** `https://your-app.netlify.app`

---

## 📋 STEP 3: Deploy Seller Portal

### **Amplify Deployment:**

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"

# Initialize Amplify
amplify init

# Choose:
# ? Enter a name for the project: marketosseller
# ? Initialize the project with the above configuration? Yes

# Add hosting
amplify add hosting

# Build and publish
npm run build
amplify publish
```

---

## 📋 STEP 4: Deploy Admin Portal

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal"

# Initialize Amplify
amplify init

# Choose:
# ? Enter a name for the project: marketosadmin

# Add hosting
amplify add hosting

# Build and publish
npm run build
amplify publish
```

---

## 📋 STEP 5: Deploy Backend Service

### **Option A: AWS Lambda + API Gateway**

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/seller-service"

# Install Serverless Framework
npm install -g serverless

# Create serverless.yml
cat > serverless.yml << 'EOF'
service: marketos-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-south-1
  environment:
    DYNAMODB_REGION: ap-south-1
    PRODUCTS_TABLE: marketos_products
    ORDERS_TABLE: marketos_orders
    SELLERS_TABLE: marketos_sellers

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
EOF

# Deploy
npm run build
serverless deploy
```

**You'll get:** `https://xxxxx.execute-api.ap-south-1.amazonaws.com/dev`

### **Option B: AWS Elastic Beanstalk (Easier)**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/backend/seller-service"
eb init -p node.js-18 marketos-backend --region ap-south-1

# Create environment
eb create marketos-backend-prod

# Deploy
eb deploy
```

**You'll get:** `http://marketos-backend-prod.xxxxx.ap-south-1.elasticbeanstalk.com`

---

## 🔧 STEP 6: Update Environment Variables

After deployment, update all portals with the new URLs:

### **Customer Portal (.env.production):**
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"

cat > .env.production << 'EOF'
REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/dev
REACT_APP_GRAPHQL_ENDPOINT=https://of2wkcq4bfea3drynu3kf7ve4q.appsync-api.ap-south-1.amazonaws.com/graphql
REACT_APP_GRAPHQL_API_KEY=da2-cawmbp4zcfarxbvfbf3lipso2a
REACT_APP_AWS_REGION=ap-south-1
EOF

# Rebuild and redeploy
npm run build
amplify publish
```

### **Driver Portal (.env.production):**
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/marketos-driver"

cat > .env.production << 'EOF'
REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/dev
REACT_APP_GRAPHQL_ENDPOINT=https://of2wkcq4bfea3drynu3kf7ve4q.appsync-api.ap-south-1.amazonaws.com/graphql
REACT_APP_GRAPHQL_API_KEY=da2-cawmbp4zcfarxbvfbf3lipso2a
EOF

npm run build
amplify publish
```

### **Seller Portal (.env.production):**
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"

cat > .env.production << 'EOF'
VITE_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/dev
VITE_GRAPHQL_ENDPOINT=https://of2wkcq4bfea3drynu3kf7ve4q.appsync-api.ap-south-1.amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=da2-cawmbp4zcfarxbvfbf3lipso2a
EOF

npm run build
amplify publish
```

### **Admin Portal (.env.production):**
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal"

cat > .env.production << 'EOF'
VITE_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/dev
VITE_BACKEND_URL=https://your-api-gateway-url.amazonaws.com/dev
EOF

npm run build
amplify publish
```

---

## 🎯 QUICK DEPLOY (All at Once)

I'll create a script to deploy everything:

```bash
#!/bin/bash
# deploy-all.sh

echo "🚀 Deploying MarketOS to the Internet..."

# 1. Customer Portal
echo "📱 Deploying Customer Portal..."
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"
npm run build
amplify publish --yes

# 2. Driver Portal  
echo "🚗 Deploying Driver Portal..."
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/marketos-driver"
npm run build
netlify deploy --prod --dir=build

# 3. Seller Portal
echo "🏪 Deploying Seller Portal..."
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal"
npm run build
netlify deploy --prod --dir=dist

# 4. Admin Portal
echo "👨‍💼 Deploying Admin Portal..."
cd "/Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/admin-portal"
npm run build
netlify deploy --prod --dir=dist

echo "✅ All portals deployed!"
```

---

## 📊 Expected Final URLs:

After deployment, you'll have:

| Portal | Platform | URL Format |
|--------|----------|------------|
| 📱 Customer | Amplify | `https://dev.xxxxxx.amplifyapp.com` |
| 🚗 Driver | Netlify | `https://marketos-driver.netlify.app` |
| 🏪 Seller | Netlify | `https://marketos-seller.netlify.app` |
| 👨‍💼 Admin | Netlify | `https://marketos-admin.netlify.app` |
| 🔧 Backend | API Gateway | `https://xxxxx.execute-api.ap-south-1.amazonaws.com/dev` |

---

## 🔒 Security Checklist:

Before going live:

- [ ] Remove console.log statements
- [ ] Set proper CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only
- [ ] Set proper API rate limits
- [ ] Test authentication flows
- [ ] Check all API endpoints

---

## 🐛 Troubleshooting:

### **Build Fails:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Amplify Deploy Fails:**
```bash
# Reset Amplify
amplify delete
amplify init
amplify add hosting
amplify publish
```

### **CORS Errors:**
Update backend to allow your frontend URLs:
```javascript
app.use(cors({
  origin: [
    'https://dev.xxxxxx.amplifyapp.com',
    'https://marketos-driver.netlify.app',
    'https://marketos-seller.netlify.app',
    'https://marketos-admin.netlify.app'
  ]
}));
```

---

## ⚡ FASTEST PATH (Next 30 Minutes):

### **Option 1: Amplify Only (Most Integrated)**
```bash
# Takes 10-15 min per portal
1. Deploy Customer Portal (already setup) - 5 min
2. Create new Amplify apps for other 3 portals - 30 min total
```

### **Option 2: Mixed (Fastest)**
```bash
# Takes 5-10 min total
1. Deploy Customer Portal via Amplify - 5 min
2. Deploy other 3 via Netlify - 5 min (parallel)
3. Deploy backend via Serverless - 5 min
```

**Recommendation: Option 2** for fastest deployment!

---

## 🎬 POST-DEPLOYMENT:

Once deployed, test:

1. ✅ All URLs load correctly
2. ✅ Authentication works
3. ✅ API calls succeed
4. ✅ Cross-portal sync works
5. ✅ Visual search works
6. ✅ Order flow works

---

## 📝 NEXT STEPS:

Would you like me to:

**A)** Start deploying Customer Portal right now via Amplify?
**B)** Set up Netlify deployments for all portals (fastest)?
**C)** Create custom deployment scripts?
**D)** Deploy backend to AWS Lambda first?

**What's your preference?** 🚀
