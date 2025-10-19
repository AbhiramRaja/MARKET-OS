const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: "ap-south-1" });
const ddb = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "marketos_products";

// More comprehensive product templates
const additionalProducts = {
  "Sports Equipment": [
    { name: "Yoga Mat Premium", price: 799, stock: 50 },
    { name: "Dumbbell Set 10kg", price: 1899, stock: 30 },
    { name: "Cricket Bat Kashmir Willow", price: 2499, stock: 20 },
    { name: "Football Size 5", price: 699, stock: 40 },
    { name: "Badminton Racket", price: 1299, stock: 35 },
    { name: "Gym Bag 40L", price: 999, stock: 45 },
    { name: "Running Shoes", price: 2999, stock: 60 }
  ],
  "Pet Supplies": [
    { name: "Dog Food 10kg Royal Canin", price: 3499, stock: 25 },
    { name: "Cat Litter 5kg", price: 599, stock: 40 },
    { name: "Pet Carrier Bag", price: 1299, stock: 20 },
    { name: "Aquarium 2ft with Filter", price: 4999, stock: 10 },
    { name: "Bird Cage Large", price: 2499, stock: 15 },
    { name: "Pet Shampoo", price: 349, stock: 50 },
    { name: "Dog Leash & Collar Set", price: 599, stock: 60 }
  ],
  "Cosmetics & Personal Care": [
    { name: "Face Moisturizer 100ml", price: 599, stock: 80 },
    { name: "Shampoo & Conditioner Set", price: 799, stock: 100 },
    { name: "Lipstick Matte Finish", price: 499, stock: 120 },
    { name: "Perfume 50ml", price: 1499, stock: 40 },
    { name: "Sunscreen SPF 50", price: 649, stock: 70 },
    { name: "Face Wash Anti-Acne", price: 349, stock: 90 },
    { name: "Hair Dryer 1800W", price: 1899, stock: 25 }
  ],
  "Home & Furniture": [
    { name: "Sofa 3-Seater Fabric", price: 24999, stock: 5 },
    { name: "Study Table with Chair", price: 8999, stock: 10 },
    { name: "Bedsheet King Size Cotton", price: 1299, stock: 50 },
    { name: "Curtains Set 7ft", price: 1899, stock: 30 },
    { name: "Wall Clock Decorative", price: 799, stock: 40 },
    { name: "Table Lamp LED", price: 1299, stock: 35 },
    { name: "Bean Bag XXL", price: 3499, stock: 20 }
  ],
  "Toys & Games": [
    { name: "LEGO Classic Set", price: 2499, stock: 30 },
    { name: "Remote Control Car", price: 1899, stock: 25 },
    { name: "Board Game Monopoly", price: 1299, stock: 40 },
    { name: "Soft Teddy Bear 3ft", price: 1499, stock: 35 },
    { name: "Puzzle 1000 Pieces", price: 699, stock: 50 },
    { name: "Barbie Doll Set", price: 1999, stock: 45 },
    { name: "Hot Wheels Track Set", price: 2999, stock: 20 }
  ],
  "Automotive": [
    { name: "Car Air Freshener Pack", price: 249, stock: 100 },
    { name: "Mobile Holder Dashboard", price: 399, stock: 80 },
    { name: "Car Vacuum Cleaner", price: 2499, stock: 25 },
    { name: "Tyre Inflator Portable", price: 1899, stock: 30 },
    { name: "Car Cover Waterproof", price: 1499, stock: 40 },
    { name: "Dash Cam Full HD", price: 3999, stock: 20 },
    { name: "Seat Covers Set", price: 2999, stock: 35 }
  ],
  "Gardening Supplies": [
    { name: "Plant Seeds Variety Pack", price: 299, stock: 100 },
    { name: "Garden Tools 5-Piece Set", price: 1299, stock: 40 },
    { name: "Ceramic Pots Set of 5", price: 899, stock: 50 },
    { name: "Organic Fertilizer 5kg", price: 599, stock: 60 },
    { name: "Garden Hose 50ft", price: 1499, stock: 30 },
    { name: "Watering Can 10L", price: 399, stock: 70 },
    { name: "Lawn Mower Electric", price: 8999, stock: 10 }
  ],
  "Office Supplies": [
    { name: "Office Chair Ergonomic", price: 8999, stock: 15 },
    { name: "Whiteboard 4x3 ft", price: 2499, stock: 20 },
    { name: "File Organizer Set", price: 799, stock: 50 },
    { name: "Printer Wireless", price: 12999, stock: 10 },
    { name: "Paper Shredder", price: 4999, stock: 12 },
    { name: "Calculator Scientific", price: 599, stock: 60 },
    { name: "Desk Organizer", price: 899, stock: 40 }
  ],
  "Musical Instruments": [
    { name: "Acoustic Guitar 6-String", price: 7999, stock: 15 },
    { name: "Keyboard 61 Keys", price: 12999, stock: 10 },
    { name: "Tabla Set", price: 5999, stock: 12 },
    { name: "Harmonium Standard", price: 8999, stock: 8 },
    { name: "Microphone with Stand", price: 2999, stock: 25 },
    { name: "Ukulele 21\"", price: 2499, stock: 20 },
    { name: "Drum Pad Electronic", price: 15999, stock: 6 }
  ]
};

// Add more products to existing categories
const moreGrocery = [
  { sellerId: "SELLER_003", category: "General Grocery", name: "Milk 1L Toned", price: 55, stock: 100 },
  { sellerId: "SELLER_003", category: "General Grocery", name: "Bread Whole Wheat", price: 40, stock: 80 },
  { sellerId: "SELLER_003", category: "General Grocery", name: "Eggs 30 pcs", price: 180, stock: 60 },
  { sellerId: "SELLER_004", category: "General Grocery", name: "Peanut Butter 500g", price: 299, stock: 40 },
  { sellerId: "SELLER_004", category: "General Grocery", name: "Oats 1kg", price: 199, stock: 70 },
  { sellerId: "SELLER_004", category: "General Grocery", name: "Green Tea 100 Bags", price: 349, stock: 50 }
];

const moreFruits = [
  { sellerId: "SELLER_001", category: "Fruits & Vegetables", name: "Oranges 1kg", price: 80, stock: 60 },
  { sellerId: "SELLER_001", category: "Fruits & Vegetables", name: "Grapes Green 500g", price: 90, stock: 40 },
  { sellerId: "SELLER_002", category: "Fruits & Vegetables", name: "Pomegranate", price: 150, stock: 30 },
  { sellerId: "SELLER_002", category: "Fruits & Vegetables", name: "Watermelon", price: 40, stock: 50 },
  { sellerId: "SELLER_001", category: "Fruits & Vegetables", name: "Cucumber 500g", price: 30, stock: 80 },
  { sellerId: "SELLER_002", category: "Fruits & Vegetables", name: "Onions 1kg", price: 40, stock: 100 }
];

const moreElectronics = [
  { sellerId: "SELLER_005", category: "Consumer Electronics", name: "Gaming Mouse RGB", price: 1899, stock: 40 },
  { sellerId: "SELLER_005", category: "Consumer Electronics", name: "Mechanical Keyboard", price: 4999, stock: 20 },
  { sellerId: "SELLER_006", category: "Mobile & Accessories", name: "Wireless Charger 15W", price: 1299, stock: 50 },
  { sellerId: "SELLER_006", category: "Mobile & Accessories", name: "Phone Ring Holder", price: 199, stock: 100 },
  { sellerId: "SELLER_005", category: "Consumer Electronics", name: "External SSD 1TB", price: 8999, stock: 15 },
  { sellerId: "SELLER_006", category: "Mobile & Accessories", name: "Selfie Stick Tripod", price: 799, stock: 60 }
];

async function seedAdditionalProducts() {
  console.log("Adding more products to all categories...\n");
  let count = 0;

  // Seed category-specific products
  const sellerCategoryMap = {
    "SELLER_012": "Sports Equipment",
    "SELLER_013": "Pet Supplies",
    "SELLER_014": "Cosmetics & Personal Care",
    "SELLER_015": "Home & Furniture",
    "SELLER_016": "Toys & Games",
    "SELLER_017": "Automotive",
    "SELLER_018": "Gardening Supplies",
    "SELLER_019": "Office Supplies",
    "SELLER_020": "Musical Instruments"
  };

  for (const [sellerId, category] of Object.entries(sellerCategoryMap)) {
    const products = additionalProducts[category] || [];
    for (const product of products) {
      await ddb.send(new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          productId: randomUUID(),
          sellerId,
          name: product.name,
          description: `Premium ${product.name}`,
          price: product.price,
          stock: product.stock,
          category,
          images: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      count++;
    }
    console.log(`✓ Added ${products.length} products for ${category}`);
  }

  // Add more grocery items
  for (const item of moreGrocery) {
    await ddb.send(new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: {
        productId: randomUUID(),
        ...item,
        description: `Fresh ${item.name}`,
        images: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
    count++;
  }
  console.log(`✓ Added ${moreGrocery.length} more grocery items`);

  // Add more fruits
  for (const item of moreFruits) {
    await ddb.send(new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: {
        productId: randomUUID(),
        ...item,
        description: `Fresh ${item.name}`,
        images: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
    count++;
  }
  console.log(`✓ Added ${moreFruits.length} more fruits & vegetables`);

  // Add more electronics
  for (const item of moreElectronics) {
    await ddb.send(new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: {
        productId: randomUUID(),
        ...item,
        description: `High-quality ${item.name}`,
        images: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
    count++;
  }
  console.log(`✓ Added ${moreElectronics.length} more electronics`);

  console.log(`\n✅ Total new products added: ${count}`);
  console.log(`🎉 Database now has comprehensive product catalog!`);
}

seedAdditionalProducts().catch(console.error);
