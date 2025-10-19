#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"
BASE_DIR="$HOME/Documents/MarketOS_Seller"
CDK_DIR="$BASE_DIR/backend/cdk"
LAMBDA_SRC="$CDK_DIR/src/lambdas"

echo "Using AWS_PROFILE=$AWS_PROFILE, AWS_REGION=$AWS_REGION"
echo "Creating project at: $BASE_DIR"

mkdir -p "$LAMBDA_SRC" "$BASE_DIR/frontend"
cd "$BASE_DIR"

cat > "$BASE_DIR/README.md" <<'MD'
# MarketOS_Seller (AWS + CDK)
Deploy:
  cd backend/cdk
  npm i
  npx cdk bootstrap
  npx cdk deploy --all
MD

mkdir -p "$CDK_DIR"
cat > "$CDK_DIR/package.json" <<'PKG'
{
  "name": "marketos-seller-cdk",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "synth": "cdk synth",
    "deploy": "cdk deploy --all",
    "bootstrap": "cdk bootstrap"
  },
  "devDependencies": {
    "esbuild": "^0.21.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.4"
  },
  "dependencies": {
    "aws-cdk-lib": "^2.154.0",
    "constructs": "^10.3.0",
    "source-map-support": "^0.5.21",
    "@aws-sdk/client-dynamodb": "^3.670.0",
    "@aws-sdk/lib-dynamodb": "^3.670.0",
    "@aws-sdk/client-s3": "^3.670.0",
    "@aws-sdk/s3-request-presigner": "^3.670.0"
  }
}
PKG

cat > "$CDK_DIR/tsconfig.json" <<'TS'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "Node",
    "outDir": "dist"
  },
  "include": ["bin", "lib", "src"]
}
TS

cat > "$CDK_DIR/cdk.json" <<'CDK'
{ "app": "npx ts-node --prefer-ts-exts bin/marketos-seller.ts" }
CDK

mkdir -p "$CDK_DIR/bin" "$CDK_DIR/lib"
cat > "$CDK_DIR/bin/marketos-seller.ts" <<'BIN'
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/AuthStack';
import { StorageStack } from '../lib/StorageStack';
import { ApiStack } from '../lib/ApiStack';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const auth = new AuthStack(app, 'SellerAuthStack', { env });
const storage = new StorageStack(app, 'SellerStorageStack', { env });
new ApiStack(app, 'SellerApiStack', {
  env,
  productsTable: storage.productsTable,
  ordersTable: storage.ordersTable,
  assetBucket: storage.assetBucket,
  userPool: auth.userPool
});
BIN

cat > "$CDK_DIR/lib/AuthStack.ts" <<'AUTH'
import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.userPool = new cognito.UserPool(this, 'SellerUserPool', {
      userPoolName: 'marketos-seller-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.userPoolClient = this.userPool.addClient('SellerUserPoolClient', {
      authFlows: { userPassword: true, userSrp: true },
      generateSecret: false,
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30)
    });
    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
  }
}
AUTH

cat > "$CDK_DIR/lib/StorageStack.ts" <<'STORE'
import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
export class StorageStack extends Stack {
  public readonly assetBucket: s3.Bucket;
  public readonly productsTable: dynamodb.Table;
  public readonly ordersTable: dynamodb.Table;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.assetBucket = new s3.Bucket(this, 'SellerAssetBucket', {
      bucketName: `marketos-seller-assets-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'marketos_products',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'sellerId-index',
      partitionKey: { name: 'sellerId', type: dynamodb.AttributeType.STRING }
    });
    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'marketos_orders',
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.ordersTable.addGlobalSecondaryIndex({
      indexName: 'sellerId-index',
      partitionKey: { name: 'sellerId', type: dynamodb.AttributeType.STRING }
    });
    new CfnOutput(this, 'AssetBucketName', { value: this.assetBucket.bucketName });
    new CfnOutput(this, 'ProductsTableName', { value: this.productsTable.tableName });
    new CfnOutput(this, 'OrdersTableName', { value: this.ordersTable.tableName });
  }
}
STORE

cat > "$CDK_DIR/lib/ApiStack.ts" <<'API'
import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as node from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { join } from 'path';

interface ApiProps extends StackProps {
  productsTable: dynamodb.Table;
  ordersTable: dynamodb.Table;
  assetBucket: s3.Bucket;
  userPool: cognito.UserPool;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id, props);

    const productsFn = new node.NodejsFunction(this, 'ProductsFn', {
      entry: join(__dirname, '..', 'src', 'lambdas', 'products.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 512,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        PRODUCTS_TABLE: props.productsTable.tableName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      }
    });
    props.productsTable.grantReadWriteData(productsFn);

    const presignFn = new node.NodejsFunction(this, 'PresignFn', {
      entry: join(__dirname, '..', 'src', 'lambdas', 'presign.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      logRetention: RetentionDays.ONE_WEEK,
      environment: {
        ASSET_BUCKET: props.assetBucket.bucketName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      }
    });
    props.assetBucket.grantPut(presignFn);
    presignFn.addToRolePolicy(new PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [props.assetBucket.arnForObjects('*')]
    }));

    const api = new apigw.RestApi(this, 'SellerApi', {
      restApiName: 'marketos-seller-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['*']
      }
    });

    const apiRoot = api.root.addResource('api');
    const products = apiRoot.addResource('products');
    products.addMethod('GET', new apigw.LambdaIntegration(productsFn));
    products.addMethod('POST', new apigw.LambdaIntegration(productsFn));
    const productById = products.addResource('{id}');
    productById.addMethod('GET', new apigw.LambdaIntegration(productsFn));
    productById.addMethod('PUT', new apigw.LambdaIntegration(productsFn));
    productById.addMethod('DELETE', new apigw.LambdaIntegration(productsFn));
    const upload = apiRoot.addResource('upload-url');
    upload.addMethod('POST', new apigw.LambdaIntegration(presignFn));

    new CfnOutput(this, 'ApiBaseUrl', { value: api.url ?? 'undefined' });
  }
}
API

mkdir -p "$LAMBDA_SRC"
cat > "$LAMBDA_SRC/products.ts" <<'LAMBDA_P'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'node:crypto';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.PRODUCTS_TABLE!;

const json = (code: number, body: unknown) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const handler = async (event: any) => {
  try {
    const method = event.httpMethod || event.requestContext?.http?.method;
    const path = event.resource || event.rawPath || '';
    const id = event.pathParameters?.id;

    if (method === 'GET' && path?.includes('/products') && !id) {
      const res = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: 100 }));
      return json(200, res.Items ?? []);
    }
    if (method === 'GET' && id) {
      const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { productId: id } }));
      if (!res.Item) return json(404, { message: 'Not found' });
      return json(200, res.Item);
    }
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const productId = body.productId || crypto.randomUUID();
      const now = new Date().toISOString();
      const item = {
        productId,
        name: body.name,
        price: body.price,
        sellerId: body.sellerId || 'UNKNOWN_SELLER',
        images: body.images || [],
        createdAt: now,
        updatedAt: now,
        ...body.extra
      };
      await ddb.send(new PutCommand({ TableName: TABLE, Item: item, ConditionExpression: 'attribute_not_exists(productId)' }));
      return json(201, item);
    }
    if (method === 'PUT' && id) {
      const body = JSON.parse(event.body || '{}');
      const now = new Date().toISOString();
      const res = await ddb.send(new UpdateCommand({
        TableName: TABLE,
        Key: { productId: id },
        UpdateExpression: 'SET #n = :n, #p = :p, #u = :u, images = :imgs',
        ExpressionAttributeNames: { '#n': 'name', '#p': 'price', '#u': 'updatedAt' },
        ExpressionAttributeValues: { ':n': body.name, ':p': body.price, ':u': now, ':imgs': body.images || [] },
        ReturnValues: 'ALL_NEW'
      }));
      return json(200, res.Attributes);
    }
    if (method === 'DELETE' && id) {
      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { productId: id } }));
      return json(204, {});
    }
    return json(400, { message: 'Unsupported route' });
  } catch (err: any) {
    console.error(err);
    return json(500, { message: 'Internal error', error: err?.message });
  }
};
LAMBDA_P

cat > "$LAMBDA_SRC/presign.ts" <<'LAMBDA_S'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const s3 = new S3Client({});
const BUCKET = process.env.ASSET_BUCKET!;
const json = (code: number, body: unknown) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const key = body.key;
    const contentType = body.contentType || 'application/octet-stream';
    if (!key) return json(400, { message: 'key is required' });
    const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    return json(200, { uploadUrl: url, key });
  } catch (err: any) {
    console.error(err);
    return json(500, { message: 'Internal error', error: err?.message });
  }
};
LAMBDA_S

cd "$CDK_DIR"
npm i
export CDK_DEFAULT_REGION="$AWS_REGION"
export CDK_DEFAULT_ACCOUNT="$(aws sts get-caller-identity --query Account --output text --profile "$AWS_PROFILE")"
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION --profile "$AWS_PROFILE"
npx cdk deploy --all --require-approval never --profile "$AWS_PROFILE"

if command -v code >/dev/null 2>&1; then code "$BASE_DIR"; fi
echo "Done. Check CDK outputs for ApiBaseUrl, UserPoolId, UserPoolClientId, AssetBucketName."
