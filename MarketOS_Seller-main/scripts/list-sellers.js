import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function listSellers() {
  const { Items: products } = await docClient.send(new ScanCommand({
    TableName: 'marketos_products',
  }));

  const bySeller = {};
  products.forEach(p => {
    const sid = p.sellerId;
    if (!bySeller[sid]) {
      bySeller[sid] = { products: [], category: p.category };
    }
    bySeller[sid].products.push(p.name);
  });

  console.log('📋 SELLER ACCOUNTS\n');
  console.log('Default Login: testuser@example.com');
  console.log('Password: (whatever you set during signup)\n');
  console.log('Available Sellers:\n');

  Object.entries(bySeller).forEach(([sellerId, data]) => {
    console.log(`${sellerId}:`);
    console.log(`  Category: ${data.category}`);
    console.log(`  Products: ${data.products.length}`);
    console.log(`  Items: ${data.products.slice(0, 3).join(', ')}${data.products.length > 3 ? '...' : ''}`);
    console.log('');
  });

  console.log('\n💡 To switch sellers:');
  console.log('Run in browser console:');
  console.log(`localStorage.setItem('sellerId', 'seller2')`);
  console.log(`localStorage.setItem('sellerName', 'Grocery Store')`);
  console.log(`location.reload()`);
}

listSellers().catch(console.error);
