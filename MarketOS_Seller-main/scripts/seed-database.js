import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Each seller has ONE category only
const SELLERS = [
  { id: 'seller1', category: 'Electronics', storeName: 'TechHub Electronics' },
  { id: 'seller2', category: 'Grocery', storeName: 'FreshMart Groceries' },
  { id: 'seller3', category: 'Books', storeName: 'Bookworm Store' },
  { id: 'seller4', category: 'Toys', storeName: 'KidsWorld Toys' },
  { id: 'seller5', category: 'Fashion', storeName: 'StyleZone Fashion' },
  { id: 'seller6', category: 'Home', storeName: 'HomeComfort' },
  { id: 'seller7', category: 'Sports', storeName: 'FitGear Sports' },
  { id: 'seller8', category: 'Beauty', storeName: 'GlowUp Beauty' },
];

const PRODUCTS_BY_CATEGORY = {
  Electronics: [
    { name: 'Wireless Gaming Mouse', price: 899, stock: 45, desc: 'RGB lighting, 6 programmable buttons' },
    { name: 'USB-C Fast Charging Cable', price: 299, stock: 120, desc: '3A fast charging, 1.5m length' },
    { name: 'Bluetooth Portable Speaker', price: 1999, stock: 8, desc: '10W output, 12hr battery' },
    { name: 'Premium Phone Case', price: 499, stock: 60, desc: 'Shockproof, multiple colors' },
    { name: 'Power Bank 10000mAh', price: 1499, stock: 25, desc: 'Dual USB ports, LED display' },
    { name: 'Wireless Earbuds', price: 2499, stock: 5, desc: 'Touch controls, 24hr playtime' },
    { name: 'HDMI Cable 2m', price: 350, stock: 80, desc: '4K support, gold-plated' },
  ],
  Grocery: [
    { name: 'Basmati Rice 5kg', price: 450, stock: 50, desc: 'Premium long grain rice' },
    { name: 'Sunflower Cooking Oil 1L', price: 180, stock: 6, desc: 'Heart healthy, refined' },
    { name: 'Sugar 1kg', price: 50, stock: 100, desc: 'Pure white sugar' },
    { name: 'Premium Tea Powder 500g', price: 220, stock: 40, desc: 'Assam tea leaves' },
    { name: 'Filter Coffee Powder 200g', price: 350, stock: 3, desc: 'Arabica & Robusta blend' },
    { name: 'Whole Wheat Flour 10kg', price: 400, stock: 35, desc: 'Stone ground atta' },
    { name: 'Organic Honey 500g', price: 320, stock: 8, desc: 'Raw, unprocessed' },
  ],
  Books: [
    { name: 'The Alchemist - Paulo Coelho', price: 299, stock: 15, desc: 'International bestseller' },
    { name: 'Atomic Habits - James Clear', price: 450, stock: 8, desc: 'Build good habits' },
    { name: 'Rich Dad Poor Dad', price: 350, stock: 20, desc: 'Financial literacy' },
    { name: 'Ikigai - Japanese Secret', price: 250, stock: 12, desc: 'Find your purpose' },
  ],
  Toys: [
    { name: 'LEGO City Building Set', price: 2499, stock: 12, desc: '500+ pieces, age 6+' },
    { name: 'Remote Control Racing Car', price: 1299, stock: 5, desc: 'High speed, rechargeable' },
    { name: 'Barbie Fashion Doll', price: 899, stock: 18, desc: 'With accessories' },
    { name: 'Jigsaw Puzzle 1000 pieces', price: 599, stock: 25, desc: 'Beautiful landscape' },
    { name: 'Educational Learning Tablet', price: 1999, stock: 7, desc: 'Kids learning games' },
  ],
  Fashion: [
    { name: 'Premium Cotton T-Shirt', price: 499, stock: 30, desc: 'Unisex, multiple colors' },
    { name: 'Slim Fit Denim Jeans', price: 1299, stock: 7, desc: 'Stretchable fabric' },
    { name: 'Running Sports Shoes', price: 2499, stock: 15, desc: 'Cushioned sole, breathable' },
    { name: 'Genuine Leather Belt', price: 699, stock: 20, desc: 'Formal & casual' },
    { name: 'Designer Sunglasses', price: 899, stock: 4, desc: 'UV protection' },
  ],
  Home: [
    { name: 'Bedsheet King Size', price: 1299, stock: 15, desc: 'Cotton, 300 thread count' },
    { name: 'Table Lamp LED', price: 799, stock: 8, desc: 'Adjustable brightness' },
    { name: 'Wall Clock Modern', price: 650, stock: 20, desc: 'Silent movement' },
  ],
  Sports: [
    { name: 'Yoga Mat Premium', price: 899, stock: 25, desc: 'Non-slip, 6mm thick' },
    { name: 'Dumbbells Set 10kg', price: 1499, stock: 6, desc: 'Cast iron, rubber coated' },
    { name: 'Cricket Bat Kashmir Willow', price: 2999, stock: 10, desc: 'Full size, leather grip' },
  ],
  Beauty: [
    { name: 'Face Serum Vitamin C', price: 599, stock: 20, desc: 'Anti-aging, brightening' },
    { name: 'Shampoo Argan Oil', price: 350, stock: 7, desc: 'Sulfate-free, 300ml' },
    { name: 'Lipstick Matte Finish', price: 299, stock: 30, desc: 'Long-lasting, 10 shades' },
  ],
};

async function clearTables() {
  console.log('🗑️  Clearing existing data...\n');
  
  const { Items: products } = await docClient.send(new ScanCommand({
    TableName: 'marketos_products'
  }));
  
  const { Items: orders } = await docClient.send(new ScanCommand({
    TableName: 'marketos_orders'
  }));
  
  if (products?.length > 0) {
    for (const p of products) {
      await docClient.send(new PutCommand({
        TableName: 'marketos_products',
        Item: { ...p, _deleted: true }
      }));
    }
  }
  
  if (orders?.length > 0) {
    for (const o of orders) {
      await docClient.send(new PutCommand({
        TableName: 'marketos_orders',
        Item: { ...o, _deleted: true }
      }));
    }
  }
}

async function seedDatabase() {
  await clearTables();
  
  console.log('🌱 Seeding database...\n');

  const allProducts = [];
  let productCount = 0;

  // Create products for each seller
  for (const seller of SELLERS) {
    console.log(`\n📍 ${seller.storeName} (${seller.category})...`);
    
    const categoryProducts = PRODUCTS_BY_CATEGORY[seller.category] || [];
    
    for (const product of categoryProducts) {
      const productId = randomUUID();
      const item = {
        productId,
        sellerId: seller.id,
        name: product.name,
        description: product.desc,
        price: product.price,
        stock: product.stock,
        category: seller.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({
        TableName: 'marketos_products',
        Item: item
      }));

      allProducts.push(item);
      console.log(`   ✅ ${product.name} - ₹${product.price} (Stock: ${product.stock})`);
      productCount++;
    }
  }

  console.log(`\n🎉 Created ${productCount} products across ${SELLERS.length} sellers!`);

  // Create realistic orders
  console.log('\n�� Creating orders...\n');

  const orderStatuses = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  let orderCount = 0;

  for (const seller of SELLERS) {
    const sellerProducts = allProducts.filter(p => p.sellerId === seller.id);
    const numOrders = Math.floor(Math.random() * 3) + 3; // 3-5 orders per seller
    
    console.log(`\n📦 Creating ${numOrders} orders for ${seller.storeName}...`);
    
    for (let i = 0; i < numOrders; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const items = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = sellerProducts[Math.floor(Math.random() * sellerProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const itemTotal = product.price * quantity;
        
        items.push({
          productId: product.productId,
          productName: product.name,
          quantity,
          price: product.price,
          total: itemTotal
        });
        
        totalAmount += itemTotal;
      }
      
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const orderId = `ORD${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
      
      const order = {
        orderId,
        customerId: `CUST${Math.floor(Math.random() * 100) + 1}`,
        sellerId: seller.id,
        items,
        totalAmount,
        status,
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: 'marketos_orders',
        Item: order
      }));

      const itemsDesc = items.map(i => `${i.productName} x${i.quantity}`).join(', ');
      console.log(`   ✅ ${orderId} | ${status} | ₹${totalAmount} | ${itemsDesc}`);
      orderCount++;
    }
  }

  console.log(`\n🎉 Created ${orderCount} orders!`);
  console.log('\n✨ Database seeded successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${SELLERS.length} sellers`);
  console.log(`   - ${productCount} products`);
  console.log(`   - ${orderCount} orders`);
}

seedDatabase().catch(console.error);
