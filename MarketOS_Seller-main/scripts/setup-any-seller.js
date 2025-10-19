import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// We'll create data for multiple sellers so any login will work
const SELLERS_DATA = {
  seller1: {
    category: 'Electronics',
    products: [
      { name: 'Wireless Gaming Mouse', price: 899, stock: 45 },
      { name: 'USB-C Cable', price: 299, stock: 120 },
      { name: 'Bluetooth Speaker', price: 1999, stock: 8 },
      { name: 'Phone Case', price: 499, stock: 60 },
      { name: 'Power Bank 10000mAh', price: 1499, stock: 3 },
    ]
  },
  seller2: {
    category: 'Grocery',
    products: [
      { name: 'Basmati Rice 5kg', price: 450, stock: 50 },
      { name: 'Cooking Oil 1L', price: 180, stock: 6 },
      { name: 'Sugar 1kg', price: 50, stock: 100 },
      { name: 'Tea 500g', price: 220, stock: 40 },
    ]
  },
  seller3: {
    category: 'Books',
    products: [
      { name: 'The Alchemist', price: 299, stock: 15 },
      { name: 'Atomic Habits', price: 450, stock: 8 },
      { name: 'Rich Dad Poor Dad', price: 350, stock: 20 },
    ]
  },
  seller4: {
    category: 'Toys',
    products: [
      { name: 'LEGO City Set', price: 2499, stock: 12 },
      { name: 'RC Car', price: 1299, stock: 5 },
      { name: 'Barbie Doll', price: 899, stock: 18 },
    ]
  },
  seller5: {
    category: 'Fashion',
    products: [
      { name: 'Cotton T-Shirt', price: 499, stock: 30 },
      { name: 'Denim Jeans', price: 1299, stock: 7 },
      { name: 'Running Shoes', price: 2499, stock: 15 },
    ]
  },
};

async function setupSellers() {
  console.log('🏪 Setting up sellers with products and orders...\n');

  for (const [sellerId, data] of Object.entries(SELLERS_DATA)) {
    console.log(`\n📦 ${sellerId} - ${data.category}`);
    
    // Create products
    const productIds = [];
    for (const product of data.products) {
      const productId = randomUUID();
      productIds.push({ ...product, productId });
      
      await docClient.send(new PutCommand({
        TableName: 'marketos_products',
        Item: {
          productId,
          sellerId,
          name: product.name,
          description: `Quality ${product.name}`,
          price: product.price,
          stock: product.stock,
          category: data.category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }));
      
      console.log(`   ✅ ${product.name} - ₹${product.price} (Stock: ${product.stock})`);
    }
    
    // Create 3-5 orders for this seller
    const numOrders = Math.floor(Math.random() * 3) + 3;
    console.log(`\n   📋 Creating ${numOrders} orders...`);
    
    const statuses = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    
    for (let i = 0; i < numOrders; i++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const total = product.price * quantity;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const orderId = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

      await docClient.send(new PutCommand({
        TableName: 'marketos_orders',
        Item: {
          orderId,
          customerId: `CUST${Math.floor(Math.random() * 50) + 1}`,
          sellerId,
          items: [{
            productId: product.productId,
            productName: product.name,
            quantity,
            price: product.price,
            total
          }],
          totalAmount: total,
          status,
          createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));

      console.log(`      ${orderId} - ${status} - ₹${total}`);
    }
  }

  console.log('\n\n✨ Setup complete!');
  console.log('\n📊 Created data for 5 sellers:');
  console.log('   • seller1 - Electronics');
  console.log('   • seller2 - Grocery');
  console.log('   • seller3 - Books');
  console.log('   • seller4 - Toys');
  console.log('   • seller5 - Fashion');
  console.log('\n🔐 Default login: testuser@example.com');
}

setupSellers().catch(console.error);
