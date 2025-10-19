import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function checkSellers() {
  const { Items: products } = await docClient.send(new ScanCommand({
    TableName: 'marketos_products',
  }));

  console.log(`Total products: ${products.length}\n`);

  // Group by seller
  const bySeller = {};
  products.forEach(p => {
    const sid = p.sellerId || 'NONE';
    if (!bySeller[sid]) bySeller[sid] = [];
    bySeller[sid].push(p);
  });

  console.log('Products by seller:');
  Object.entries(bySeller).forEach(([seller, prods]) => {
    console.log(`  ${seller}: ${prods.length} products`);
    if (prods.length > 0 && prods.length < 10) {
      prods.forEach(p => console.log(`    - ${p.name}`));
    }
  });
}

checkSellers().catch(console.error);
