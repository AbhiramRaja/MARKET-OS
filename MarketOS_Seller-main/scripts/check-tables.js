import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function checkTables() {
  console.log('🔍 Checking DynamoDB tables...\n');

  try {
    const { Items: products } = await docClient.send(new ScanCommand({
      TableName: 'marketos_products',
      Limit: 5
    }));
    console.log(`📦 Products table: ${products?.length || 0} items found`);
    if (products?.length > 0) {
      console.log('Sample product:', JSON.stringify(products[0], null, 2));
    }
  } catch (e) {
    console.error('❌ Products table error:', e.message);
  }

  try {
    const { Items: orders } = await docClient.send(new ScanCommand({
      TableName: 'marketos_orders',
      Limit: 5
    }));
    console.log(`\n📋 Orders table: ${orders?.length || 0} items found`);
    if (orders?.length > 0) {
      console.log('Sample order:', JSON.stringify(orders[0], null, 2));
    }
  } catch (e) {
    console.error('❌ Orders table error:', e.message);
  }
}

checkTables().catch(console.error);
