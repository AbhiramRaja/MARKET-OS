#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/ApiStack';
import { AuthStack } from '../lib/AuthStack';
import { StorageStack } from '../lib/StorageStack';
import { RealtimeStack } from '../lib/RealtimeStack';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'ap-south-1' };

const auth = new AuthStack(app, 'SellerAuthStack', { env });
const storage = new StorageStack(app, 'SellerStorageStack', { env });

// --- API stack wires concrete resources (tables/bucket/user pool)
new ApiStack(app, 'SellerApiStack', {
  env,
  productsTable: storage.productsTable,
  ordersTable: storage.ordersTable,
  sellersTable: storage.sellersTable,
  assetBucket: storage.assetBucket,
  userPool: auth.userPool,
});

// --- Realtime stack: Pass the stream ARN directly from storage
new RealtimeStack(app, 'SellerRealtimeStack', {
  env,
  userPool: auth.userPool,
  ordersTableName: storage.ordersTable.tableName,
  ordersStreamArn: storage.ordersTable.tableStreamArn!,
});
