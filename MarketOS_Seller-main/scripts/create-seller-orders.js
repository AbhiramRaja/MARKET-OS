import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const ORDER_STATUSES = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

async function createOrders() {
  console.log('📦 Creating realistic seller orders...\n');

  const { Items: products } = await docClient.send(new ScanCommand({
    TableName: 'marketos_products'
  }));

  const productsBySeller = {};
  products.forEach(p => {
    if (!productsBySeller[p.sellerId]) {
      productsBySeller[p.sellerId] = [];
    }
    productsBySeller[p.sellerId].push(p);
  });

  let totalOrders = 0;

  for (const [sellerId, sellerProducts] of Object.entries(productsBySeller)) {
    const numOrders = Math.floor(Math.random() * 3) + 3;
    
    console.log(`\n📍 Creating ${numOrders} orders for ${sellerId}...`);
    
    for (let i = 0; i < numOrders; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = sellerProducts[Math.floor(Math.random() * sellerProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = product.price * quantity;
        
        orderItems.push({
          productId: product.productId,
          productName: product.name,
          quantity: quantity,
          price: product.price,
          total: itemTotal
        });
        
        totalAmount += itemTotal;
      }
      
      const status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
      const orderId = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;
      const customerId = `customer${Math.floor(Math.random() * 50) + 1}`;
      
      const order = {
        orderId,
        customerId,
        sellerId,
        items: orderItems,
        totalAmount,
        status,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await docClient.send(new PutCommand({
        TableName: 'marketos_orders',
        Item: order
      }));
      
      console.log(`   ✅ ${orderId} - ${status} - ₹${totalAmount} (${orderItems.length} items)`);
      totalOrders++;
    }
  }

  console.log(`\n🎉 Created ${totalOrders} orders across all sellers!`);
}

createOrders().catch(console.error);
