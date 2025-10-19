# AWS Integration Guide

## Quick Switch from localhost to AWS

### Step 1: Environment Variables

Create `frontend/seller-portal/.env`:
```env
VITE_API_BASE=https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod
VITE_USER_POOL_ID=ap-south-1_YKftW4dVh
VITE_USER_POOL_CLIENT_ID=4vmpnqb9rlq51cbl3vfr18h3g9
VITE_REGION=ap-south-1
VITE_S3_BUCKET=marketos-seller-assets-387686289729-ap-south-1
```

### Step 2: Update Amplify Config

File: `frontend/seller-portal/src/amplifyConfig.ts` (already configured!)
```typescript
Auth: {
  Cognito: {
    userPoolId: 'ap-south-1_YKftW4dVh',
    userPoolClientId: '4vmpnqb9rlq51cbl3vfr18h3g9',
    region: 'ap-south-1'
  }
}
```

### Step 3: AWS API is Already Wired!

File: `frontend/seller-portal/src/lib/aws-api.ts`
- ✅ Uses AWS API Gateway URL
- ✅ Includes Cognito authentication
- ✅ S3 image uploads ready
- ✅ All endpoints mapped

**No code changes needed!** Just set environment variables and rebuild.

### Step 4: Deploy Frontend

```bash
# Build for production
cd frontend/seller-portal
npm run build

# Deploy to S3
aws s3 sync dist/ s3://marketos-seller-portal/ --delete

# Update CloudFront (if using)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Step 5: Backend (Optional - Already on AWS)

Your AWS infrastructure includes:
- **API Gateway**: `https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod`
- **Lambda Functions**: For each endpoint
- **DynamoDB**: For data storage
- **S3**: For file uploads

**Current Setup**: Local MongoDB backend for development  
**Production**: AWS Lambda + DynamoDB (CDK code ready in `backend/cdk/`)

### To Deploy Backend to AWS Lambda

```bash
cd backend/cdk
npm install
cdk deploy MarketOSSellerStack
```

This will:
1. Create Lambda functions from your Express routes
2. Set up API Gateway endpoints
3. Configure DynamoDB tables
4. Set up S3 buckets for uploads

### Testing AWS Integration

```bash
# Test API Gateway endpoint
curl https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod/sellers

# Test with authentication
# (You'll need a valid Cognito token)
```

### AWS Resources (Already Created)

From `stack-outputs.json`:
```json
{
  "ApiEndpoint": "https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod",
  "UserPoolId": "ap-south-1_YKftW4dVh",
  "UserPoolClientId": "4vmpnqb9rlq51cbl3vfr18h3g9",
  "SellerAssetsBucket": "marketos-seller-assets-387686289729-ap-south-1"
}
```

### Troubleshooting

**CORS Issues?**
API Gateway needs CORS configured:
```typescript
// Already in Lambda functions
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
}
```

**Authentication Failing?**
Check Cognito token is being sent:
```typescript
// aws-api.ts already handles this
const token = session.tokens?.idToken?.toString()
headers: { 'Authorization': `Bearer ${token}` }
```

**Images Not Uploading?**
S3 bucket needs public read access for product images.

### Current Status

- ✅ Frontend configured for AWS
- ✅ AWS services provisioned
- ✅ Authentication ready
- ⏳ Backend needs Lambda deployment (optional)
- ⏳ DynamoDB migration from MongoDB (optional)

You can run **hybrid mode**: Frontend on AWS (S3/CloudFront) + Backend on local MongoDB for development!

---

**Next Steps**:
1. Set environment variables
2. Build frontend: `npm run build`
3. Deploy to S3
4. Test with AWS API Gateway
5. (Optional) Deploy backend to Lambda
