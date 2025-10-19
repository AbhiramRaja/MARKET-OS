const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: "ap-south-1" });
const ddb = DynamoDBDocumentClient.from(client);

const SELLERS_TABLE = "marketos_sellers";
const PRODUCTS_TABLE = "marketos_products";

// 20 diverse sellers
const sellers = [
  { id: "SELLER_001", name: "Fresh Farm Organics", type: "grocery", category: "Fruits & Vegetables" },
  { id: "SELLER_002", name: "Green Valley Produce", type: "grocery", category: "Fruits & Vegetables" },
  { id: "SELLER_003", name: "City Supermart", type: "grocery", category: "General Grocery" },
  { id: "SELLER_004", name: "Daily Needs Store", type: "grocery", category: "General Grocery" },
  { id: "SELLER_005", name: "TechHub Electronics", type: "electronics", category: "Consumer Electronics" },
  { id: "SELLER_006", name: "GadgetZone", type: "electronics", category: "Mobile & Accessories" },
  { id: "SELLER_007", name: "PowerMax Appliances", type: "appliances", category: "Home Appliances" },
  { id: "SELLER_008", name: "SmartHome Solutions", type: "appliances", category: "Smart Devices" },
  { id: "SELLER_009", name: "Kitchen King", type: "appliances", category: "Kitchen Appliances" },
  { id: "SELLER_010", name: "Fashion Hub", type: "fashion", category: "Clothing" },
  { id: "SELLER_011", name: "BookWorm Paradise", type: "books", category: "Books & Stationery" },
  { id: "SELLER_012", name: "Sports Arena", type: "sports", category: "Sports Equipment" },
  { id: "SELLER_013", name: "Pet Care Corner", type: "pets", category: "Pet Supplies" },
  { id: "SELLER_014", name: "Beauty Bliss", type: "beauty", category: "Cosmetics & Personal Care" },
  { id: "SELLER_015", name: "Home Decor Studio", type: "home", category: "Home & Furniture" },
  { id: "SELLER_016", name: "Toy Kingdom", type: "toys", category: "Toys & Games" },
  { id: "SELLER_017", name: "Auto Parts Pro", type: "automotive", category: "Automotive" },
  { id: "SELLER_018", name: "Garden Paradise", type: "garden", category: "Gardening Supplies" },
  { id: "SELLER_019", name: "Office Essentials", type: "office", category: "Office Supplies" },
  { id: "SELLER_020", name: "Music Mania", type: "music", category: "Musical Instruments" }
];

// Product templates by category
const productTemplates = {
  "Fruits & Vegetables": [
    { name: "Fresh Apples", price: 120, stock: 50 },
    { name: "Organic Bananas", price: 60, stock: 100 },
    { name: "Red Tomatoes", price: 40, stock: 80 },
    { name: "Green Capsicum", price: 80, stock: 60 },
    { name: "Fresh Spinach", price: 30, stock: 70 },
    { name: "Carrots", price: 50, stock: 90 }
  ],
  "General Grocery": [
    { name: "Basmati Rice 5kg", price: 450, stock: 40 },
    { name: "Whole Wheat Flour 10kg", price: 350, stock: 50 },
    { name: "Olive Oil 1L", price: 650, stock: 30 },
    { name: "Brown Sugar 1kg", price: 80, stock: 60 },
    { name: "Organic Honey 500g", price: 250, stock: 25 }
  ],
  "Consumer Electronics": [
    { name: "Wireless Bluetooth Earbuds", price: 2499, stock: 20 },
    { name: "Smart LED TV 43\"", price: 28999, stock: 10 },
    { name: "Laptop Stand Aluminum", price: 1299, stock: 30 },
    { name: "USB-C Hub 7-in-1", price: 1899, stock: 25 },
    { name: "Wireless Mouse", price: 599, stock: 50 }
  ],
  "Mobile & Accessories": [
    { name: "Smartphone Case", price: 399, stock: 100 },
    { name: "Tempered Glass Screen Protector", price: 199, stock: 150 },
    { name: "20W Fast Charger", price: 699, stock: 80 },
    { name: "Power Bank 10000mAh", price: 1299, stock: 60 },
    { name: "Car Phone Holder", price: 349, stock: 70 }
  ],
  "Home Appliances": [
    { name: "Washing Machine 7kg", price: 18999, stock: 5 },
    { name: "Refrigerator 265L", price: 24999, stock: 8 },
    { name: "Air Conditioner 1.5 Ton", price: 32999, stock: 6 },
    { name: "Vacuum Cleaner", price: 4999, stock: 15 },
    { name: "Water Purifier", price: 12999, stock: 12 }
  ],
  "Smart Devices": [
    { name: "Smart Speaker", price: 3999, stock: 25 },
    { name: "Smart Bulb (Pack of 3)", price: 1499, stock: 40 },
    { name: "Smart Plug", price: 699, stock: 50 },
    { name: "Video Doorbell", price: 5999, stock: 15 },
    { name: "Security Camera", price: 2999, stock: 20 }
  ],
  "Kitchen Appliances": [
    { name: "Microwave Oven 20L", price: 6999, stock: 10 },
    { name: "Electric Kettle 1.8L", price: 1299, stock: 30 },
    { name: "Mixer Grinder", price: 3499, stock: 20 },
    { name: "Induction Cooktop", price: 2499, stock: 25 },
    { name: "Air Fryer 4L", price: 4999, stock: 18 }
  ],
  "Clothing": [
    { name: "Cotton T-Shirt", price: 499, stock: 100 },
    { name: "Denim Jeans", price: 1299, stock: 80 },
    { name: "Formal Shirt", price: 899, stock: 60 },
    { name: "Summer Dress", price: 1599, stock: 50 },
    { name: "Sports Track Pants", price: 699, stock: 70 }
  ],
  "Books & Stationery": [
    { name: "Bestseller Fiction Novel", price: 399, stock: 50 },
    { name: "Notebook Set (5 pack)", price: 250, stock: 100 },
    { name: "Gel Pen Box (10 pcs)", price: 150, stock: 80 },
    { name: "Study Desk Lamp", price: 799, stock: 30 },
    { name: "Backpack 30L", price: 1299, stock: 40 }
  ]
};

async function seedSellers() {
  console.log("Seeding sellers...");
  for (const seller of sellers) {
    await ddb.send(new PutCommand({
      TableName: SELLERS_TABLE,
      Item: {
        sellerId: seller.id,
        name: seller.name,
        type: seller.type,
        category: seller.category,
        email: `${seller.id.toLowerCase()}@marketos.com`,
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: `${Math.floor(Math.random() * 999) + 1}, MG Road, Bangalore`,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    }));
    console.log(`✓ Created seller: ${seller.name}`);
  }
}

async function seedProducts() {
  console.log("\nSeeding products...");
  let productCount = 0;
  
  for (const seller of sellers) {
    const templates = productTemplates[seller.category] || [];
    
    for (const template of templates) {
      const productId = randomUUID();
      await ddb.send(new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          productId,
          sellerId: seller.id,
          name: template.name,
          description: `High quality ${template.name} from ${seller.name}`,
          price: template.price,
          stock: template.stock,
          category: seller.category,
          images: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      productCount++;
    }
    console.log(`✓ Added ${templates.length} products for ${seller.name}`);
  }
  
  console.log(`\n✅ Total products created: ${productCount}`);
}

async function main() {
  try {
    await seedSellers();
    await seedProducts();
    console.log("\n🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

main();
