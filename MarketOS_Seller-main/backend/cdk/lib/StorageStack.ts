import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class StorageStack extends Stack {
  public readonly productsTable: dynamodb.Table;
  public readonly ordersTable: dynamodb.Table;
  public readonly sellersTable: dynamodb.ITable;
  public readonly verificationRequestsTable: dynamodb.Table;
  public readonly assetBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'marketos_products',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // NOTE: no removalPolicy here — avoid DeletionPolicy diffs
    });
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'sellerId-index',
      partitionKey: { name: 'sellerId', type: dynamodb.AttributeType.STRING },
    });

    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'marketos_orders',
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // EXACT live mode
      // NOTE: no removalPolicy here — avoid DeletionPolicy diffs
    });
    this.ordersTable.addGlobalSecondaryIndex({
      indexName: 'sellerId-index',
      partitionKey: { name: 'sellerId', type: dynamodb.AttributeType.STRING },
    });

    // Reference existing sellers table (don't create, just import)
    this.sellersTable = dynamodb.Table.fromTableName(this, 'SellersTable', 'marketos_sellers');

    // Create verification requests table
    this.verificationRequestsTable = new dynamodb.Table(this, 'VerificationRequestsTable', {
      tableName: 'marketos_verification_requests',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.verificationRequestsTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
    });

    // keep bucket shape stable to avoid policy churn
    this.assetBucket = new s3.Bucket(this, 'SellerAssetBucket', {
      bucketName: `marketos-seller-assets-${Stack.of(this).account}-${Stack.of(this).region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY, // REQUIRED with autoDeleteObjects
    });


    new CfnOutput(this, 'ProductsTableName', { value: this.productsTable.tableName });
    new CfnOutput(this, 'OrdersTableName', { value: this.ordersTable.tableName });
    new CfnOutput(this, 'SellersTableName', { value: this.sellersTable.tableName });
    new CfnOutput(this, 'VerificationRequestsTableName', { value: this.verificationRequestsTable.tableName });
    new CfnOutput(this, 'AssetBucketName', { value: this.assetBucket.bucketName });
  }
}
