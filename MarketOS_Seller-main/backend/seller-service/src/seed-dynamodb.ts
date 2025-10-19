// DynamoDB Seed Script for MarketOS Seller Portal
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'ap-south-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLES = {
  SELLERS: 'marketos_sellers',
  PRODUCTS: 'marketos_products',
  ORDERS: 'marketos_orders',
  VERIFICATION_REQUESTS: 'marketos_verification_requests'
};

// Categories and their corresponding business types
const categories = [
  { name: 'Electronics', businesses: ['TechMart', 'GadgetWorld', 'ElectroHub', 'SmartDevices', 'CircuitCity'] },
  { name: 'Fashion', businesses: ['StyleBoutique', 'TrendyWear', 'FashionForward', 'ChicCloset', 'UrbanThreads'] },
  { name: 'Home & Kitchen', businesses: ['HomeComfort', 'KitchenPro', 'CozyLiving', 'CulinaryEssentials', 'HomeSweetHome'] },
  { name: 'Sports & Fitness', businesses: ['FitGear', 'ActiveLife', 'SportZone', 'FitnessFirst', 'AthletePro'] },
  { name: 'Books', businesses: ['BookHaven', 'ReadersCorner', 'LiteraryWorld', 'PageTurner', 'NovelIdeas'] },
  { name: 'Beauty & Personal Care', businesses: ['GlowBeauty', 'PureEssence', 'BeautyBliss', 'RadiantSkin', 'CharmCosmetics'] },
  { name: 'Toys & Games', businesses: ['ToyBox', 'PlayLand', 'FunFactory', 'KidsJoy', 'GameZone'] }
];

// Product templates by category
const productTemplates: Record<string, string[]> = {
  'Electronics': [
    'Wireless Headphones', 'Smart Watch', 'Bluetooth Speaker', 'USB Cable', 'Phone Case',
    'Laptop Stand', 'Wireless Mouse', 'Keyboard', 'Webcam', 'Power Bank',
    'Phone Charger', 'HDMI Cable', 'Memory Card', 'Phone Holder', 'Screen Protector',
    'Earbuds', 'Tablet Stand', 'Charging Cable', 'Adapter', 'Extension Cord',
    'Laptop Bag', 'Mouse Pad', 'Cable Organizer', 'USB Hub', 'Portable SSD',
    'External Hard Drive', 'Card Reader', 'Laptop Cooler', 'LED Strip Light', 'Smart Plug',
    'Wi-Fi Router', 'Network Switch', 'Ethernet Cable', 'Surge Protector', 'Battery Pack'
  ],
  'Fashion': [
    'Cotton T-Shirt', 'Denim Jeans', 'Casual Shirt', 'Formal Pants', 'Summer Dress',
    'Leather Jacket', 'Hoodie', 'Sweater', 'Shorts', 'Skirt',
    'Blazer', 'Track Pants', 'Polo Shirt', 'Cargo Pants', 'Maxi Dress',
    'Tank Top', 'Cardigan', 'Jumpsuit', 'Leggings', 'Joggers',
    'Denim Jacket', 'Trench Coat', 'Scarf', 'Belt', 'Hat',
    'Sunglasses', 'Watch', 'Handbag', 'Wallet', 'Backpack',
    'Sneakers', 'Sandals', 'Boots', 'Formal Shoes', 'Slippers'
  ],
  'Home & Kitchen': [
    'Kitchen Mixer', 'Blender', 'Toaster', 'Coffee Maker', 'Rice Cooker',
    'Pressure Cooker', 'Air Fryer', 'Microwave Oven', 'Electric Kettle', 'Food Processor',
    'Knife Set', 'Cutting Board', 'Cookware Set', 'Baking Tray', 'Mixing Bowl',
    'Storage Container', 'Spice Rack', 'Kitchen Scale', 'Measuring Cups', 'Spatula Set',
    'Dish Rack', 'Trash Can', 'Soap Dispenser', 'Kitchen Towels', 'Oven Mitts',
    'Bed Sheet Set', 'Pillow', 'Comforter', 'Curtains', 'Bath Towel',
    'Shower Curtain', 'Bath Mat', 'Laundry Basket', 'Hangers', 'Storage Bins'
  ],
  'Sports & Fitness': [
    'Yoga Mat', 'Dumbbell Set', 'Resistance Bands', 'Jump Rope', 'Exercise Ball',
    'Foam Roller', 'Kettlebell', 'Pull-up Bar', 'Ab Roller', 'Push-up Bars',
    'Running Shoes', 'Sports Bottle', 'Gym Bag', 'Workout Gloves', 'Sweatband',
    'Ankle Weights', 'Fitness Tracker', 'Heart Rate Monitor', 'Protein Shaker', 'Yoga Block',
    'Basketball', 'Football', 'Tennis Racket', 'Badminton Set', 'Cricket Bat',
    'Swimming Goggles', 'Cycling Gloves', 'Bike Helmet', 'Knee Pads', 'Elbow Pads',
    'Treadmill', 'Exercise Bike', 'Weight Bench', 'Punching Bag', 'Boxing Gloves'
  ],
  'Books': [
    'Fiction Novel', 'Mystery Thriller', 'Romance Novel', 'Science Fiction', 'Fantasy Book',
    'Biography', 'Self-Help Book', 'Cookbook', 'Travel Guide', 'History Book',
    'Business Book', 'Psychology Book', 'Philosophy Book', 'Poetry Collection', 'Art Book',
    'Children\'s Book', 'Young Adult Novel', 'Graphic Novel', 'Comic Book', 'Textbook',
    'Dictionary', 'Encyclopedia', 'Language Learning', 'Music Book', 'Photography Book',
    'Gardening Guide', 'DIY Manual', 'Health Guide', 'Parenting Book', 'Finance Book',
    'Technology Book', 'Science Book', 'Math Book', 'Engineering Book', 'Medical Book'
  ],
  'Beauty & Personal Care': [
    'Face Cream', 'Body Lotion', 'Shampoo', 'Conditioner', 'Face Wash',
    'Moisturizer', 'Sunscreen', 'Face Mask', 'Serum', 'Toner',
    'Lip Balm', 'Lipstick', 'Foundation', 'Mascara', 'Eyeliner',
    'Eyeshadow Palette', 'Blush', 'Highlighter', 'Makeup Remover', 'Nail Polish',
    'Hair Oil', 'Hair Serum', 'Hair Mask', 'Hair Spray', 'Hair Gel',
    'Body Wash', 'Soap', 'Deodorant', 'Perfume', 'Body Spray',
    'Toothpaste', 'Toothbrush', 'Mouthwash', 'Dental Floss', 'Face Scrub'
  ],
  'Toys & Games': [
    'Building Blocks', 'Puzzle Set', 'Board Game', 'Card Game', 'Action Figure',
    'Doll', 'Stuffed Animal', 'Remote Control Car', 'Drone', 'Robot Toy',
    'Educational Toy', 'Musical Instrument', 'Art Set', 'Craft Kit', 'Science Kit',
    'Lego Set', 'Barbie Doll', 'Hot Wheels Car', 'Nerf Gun', 'Water Gun',
    'Play Kitchen', 'Tool Set', 'Doctor Kit', 'Dress-up Costume', 'Toy Train',
    'Dollhouse', 'Play Tent', 'Ball Pit', 'Trampoline', 'Swing Set',
    'Tricycle', 'Scooter', 'Bicycle', 'Roller Skates', 'Skateboard'
  ]
};

// Generate 35 sellers (5 per category)
const sellers = categories.flatMap((category, catIndex) => 
  category.businesses.map((business, bizIndex) => {
    const sellerNum = catIndex * 5 + bizIndex + 1;
    const sellerId = `seller_${String(sellerNum).padStart(3, '0')}`;
    const isVerified = sellerNum <= 30; // First 30 verified, last 5 pending
    
    return {
      email: `${business.toLowerCase().replace(/\s+/g, '')}@example.com`,
      sellerId,
      businessName: `${business} ${category.name}`,
      phone: `+91-98765${String(43210 + sellerNum).slice(-5)}`,
      category: category.name,
      verified: isVerified,
      verificationStatus: isVerified ? 'approved' : 'pending',
      rating: isVerified ? parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) : 0,
      joinedDate: new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString()
    };
  })
);

// Generate 35+ products per seller
const products = sellers.flatMap(seller => {
  const categoryProducts = productTemplates[seller.category] || productTemplates['Electronics'];
  
  return categoryProducts.map((productName, index) => {
    const productId = `prod_${seller.sellerId}_${String(index + 1).padStart(3, '0')}`;
    
    // Much more affordable prices based on category
    let basePrice;
    let imageUrl;
    
    switch (seller.category) {
      case 'Electronics':
        basePrice = Math.floor(Math.random() * 3000) + 299; // ₹299 - ₹3,299
        imageUrl = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80`; // Product image
        break;
      case 'Fashion':
        basePrice = Math.floor(Math.random() * 1500) + 199; // ₹199 - ₹1,699
        imageUrl = `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop&q=80`; // Clothing
        break;
      case 'Home & Kitchen':
        basePrice = Math.floor(Math.random() * 2000) + 249; // ₹249 - ₹2,249
        imageUrl = `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&q=80`; // Kitchen items
        break;
      case 'Sports & Fitness':
        basePrice = Math.floor(Math.random() * 2500) + 299; // ₹299 - ₹2,799
        imageUrl = `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&q=80`; // Fitness
        break;
      case 'Books':
        basePrice = Math.floor(Math.random() * 600) + 149; // ₹149 - ₹749
        imageUrl = `https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&q=80`; // Books
        break;
      case 'Beauty & Personal Care':
        basePrice = Math.floor(Math.random() * 1200) + 149; // ₹149 - ₹1,349
        imageUrl = `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80`; // Beauty products
        break;
      case 'Toys & Games':
        basePrice = Math.floor(Math.random() * 1800) + 199; // ₹199 - ₹1,999
        imageUrl = `https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop&q=80`; // Toys
        break;
      default:
        basePrice = Math.floor(Math.random() * 1000) + 299;
        imageUrl = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80`;
    }
    
    const stock = Math.floor(Math.random() * 100) + 10;
    const sold = Math.floor(Math.random() * 50);
    
    return {
      productId,
      sellerId: seller.sellerId,
      name: `${productName} - ${seller.businessName.split(' ')[0]}`,
      description: `High quality ${productName.toLowerCase()} from ${seller.businessName}`,
      price: basePrice,
      category: seller.category,
      stock,
      sold,
      status: Math.random() > 0.15 ? 'active' : (Math.random() > 0.5 ? 'out-of-stock' : 'discontinued'),
      imageUrl
    };
  });
});

// Generate multiple orders per seller
const customerNames = [
  'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown',
  'Emily Davis', 'Chris Wilson', 'Amanda Taylor', 'James Anderson', 'Lisa Thomas',
  'Robert Jackson', 'Maria Garcia', 'Michael Martinez', 'Jennifer Robinson', 'William Clark'
];

const cities = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
];

const statuses = ['delivered', 'pending', 'processing', 'shipped'];

// Generate 10-25 orders per seller (more for verified sellers, ensuring everyone has orders)
const orders = sellers.flatMap(seller => {
  const sellerProducts = products.filter(p => p.sellerId === seller.sellerId && p.status === 'active');
  
  // Ensure minimum orders even for pending sellers
  const orderCount = seller.verified 
    ? Math.floor(Math.random() * 16) + 10  // 10-25 orders for verified
    : Math.floor(Math.random() * 6) + 5;    // 5-10 orders for pending
  
  return Array.from({ length: orderCount }, (_, orderIndex) => {
    const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
    const location = cities[Math.floor(Math.random() * cities.length)];
    const orderProducts = [];
    const numProducts = Math.floor(Math.random() * 4) + 1; // 1-4 products per order
    
    let totalAmount = 0;
    
    // Ensure we have products to choose from
    if (sellerProducts.length > 0) {
      for (let i = 0; i < numProducts; i++) {
        const product = sellerProducts[Math.floor(Math.random() * sellerProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        orderProducts.push({
          productId: product.productId,
          name: product.name,
          quantity,
          price: product.price
        });
        totalAmount += product.price * quantity;
      }
    }
    
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    
    return {
      orderId: `ord_${seller.sellerId}_${String(orderIndex + 1).padStart(3, '0')}`,
      sellerId: seller.sellerId,
      customerId: `cust_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: customer,
      customerEmail: `${customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      products: orderProducts,
      totalAmount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      shippingAddress: {
        street: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Park Ave', 'Oak Rd', 'Elm St', 'Market St'][Math.floor(Math.random() * 5)]}`,
        city: location.city,
        state: location.state,
        pincode: location.pincode
      },
      createdAt: orderDate.toISOString()
    };
  });
}).filter(order => order.products.length > 0 && order.totalAmount > 0); // Remove invalid orders

// Verification requests for pending sellers
const verificationRequests = sellers
  .filter(s => !s.verified)
  .map(seller => ({
    email: seller.email,
    sellerId: seller.sellerId,
    businessName: seller.businessName,
    documents: [
      { name: 'Business License', uploaded: true },
      { name: 'GST Certificate', uploaded: true },
      { name: 'PAN Card', uploaded: true }
    ],
    status: 'pending',
    submittedAt: new Date().toISOString()
  }));

// Helper function to batch write items
async function batchWrite(tableName: string, items: any[], label: string) {
  const batchSize = 25; // DynamoDB batch write limit
  const batches = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  console.log(`\n📦 Seeding ${label}... (${items.length} items in ${batches.length} batches)`);
  
  let completed = 0;
  for (const batch of batches) {
    const putRequests = batch.map(item => ({
      PutRequest: { Item: item }
    }));
    
    await dynamoDB.send(new BatchWriteCommand({
      RequestItems: {
        [tableName]: putRequests
      }
    }));
    
    completed += batch.length;
    process.stdout.write(`\r✅ Progress: ${completed}/${items.length} ${label}`);
  }
  console.log(`\n✅ Completed ${label}!`);
}

async function seedData() {
  try {
    console.log('🌱 Starting DynamoDB seed process with large dataset...');
    console.log(`📊 Preparing data:`);
    console.log(`   - ${sellers.length} sellers`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${orders.length} orders`);
    console.log(`   - ${verificationRequests.length} verification requests`);
    
    // Seed all data using batch writes
    await batchWrite(TABLES.SELLERS, sellers, 'sellers');
    await batchWrite(TABLES.PRODUCTS, products, 'products');
    await batchWrite(TABLES.ORDERS, orders, 'orders');
    await batchWrite(TABLES.VERIFICATION_REQUESTS, verificationRequests, 'verification requests');
    
    console.log('\n✨ Seed completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`   ✅ Sellers: ${sellers.length}`);
    console.log(`   ✅ Products: ${products.length}`);
    console.log(`   ✅ Orders: ${orders.length}`);
    console.log(`   ✅ Verification Requests: ${verificationRequests.length}`);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

seedData();
