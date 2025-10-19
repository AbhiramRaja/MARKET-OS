import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const SELLER_CATEGORIES = {
  'seller1': ['Electronics'],
  'seller2': ['Grocery'],
  'seller3': ['Books'],
  'seller4': ['Toys'],
  'seller5': ['Fashion'],
  'seller6': ['Home'],
  'seller7': ['Sports'],
  'seller8': ['Beauty'],
  'seller9': ['Electronics'],
  'seller10': ['Grocery'],
  'seller11': ['Books'],
  'seller12': ['Toys'],
  'seller13': ['Fashion'],
  'seller14': ['Home'],
  'seller15': ['Sports'],
  'seller16': ['Beauty'],
  'seller17': ['Electronics', 'Grocery'],
  'seller18': ['Books'],
  'seller19': ['Fashion'],
  'seller20': ['Grocery', 'Home'],
};

async function redistributeProducts() {
  console.log('🔄 Redistributing products among sellers by category...\n');

  const { Items: products } = await docClient.send(new ScanCommand({
    TableName: 'marketos_products'
  }));

  console.log(`📦 Found ${products.length} products\n`);

  let updated = 0;
  
  for (const product of products) {
    const category = product.category;
    
    const eligibleSellers = Object.entries(SELLER_CATEGORIES)
      .filter(([_, categories]) => categories.includes(category))
      .map(([sellerId]) => sellerId);
    
    if (eligibleSellers.length === 0) {
      console.log(`⚠️  No seller for category: ${category}, assigning to seller17`);
      eligibleSellers.push('seller17');
    }
    
    const newSellerId = eligibleSellers[Math.floor(Math.random() * eligibleSellers.length)];
    
    await docClient.send(new UpdateCommand({
      TableName: 'marketos_products',
      Key: { productId: product.productId },
      UpdateExpression: 'SET sellerId = :sellerId',
      ExpressionAttributeValues: {
        ':sellerId': newSellerId
      }
    }));
    
    console.log(`✅ ${product.name} (${category}) → ${newSellerId}`);
    updated++;
  }

  console.log(`\n🎉 Successfully redistributed ${updated} products!`);
}

redistributeProducts().catch(console.error);
