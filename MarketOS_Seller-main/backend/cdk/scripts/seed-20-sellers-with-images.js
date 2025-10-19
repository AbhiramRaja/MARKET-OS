const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "ap-south-1" }));

const SELLERS = [
  { id: "seller-electronics-hub", name: "TechWorld Electronics", businessName: "TechWorld Pvt Ltd", email: "contact@techworld.com" },
  { id: "seller-fashion-store", name: "StyleMart Fashion", businessName: "StyleMart India", email: "info@stylemart.in" },
  { id: "seller-grocery-fresh", name: "FreshFarm Groceries", businessName: "FreshFarm Foods", email: "orders@freshfarm.com" },
  { id: "seller-home-decor", name: "HomeStyle Decor", businessName: "HomeStyle Enterprises", email: "hello@homestyle.in" },
  { id: "seller-sports-gear", name: "ActiveFit Sports", businessName: "ActiveFit India", email: "support@activefit.com" },
  { id: "seller-books-store", name: "BookWorm Books", businessName: "BookWorm Pvt Ltd", email: "contact@bookworm.in" },
  { id: "seller-beauty-care", name: "GlowUp Cosmetics", businessName: "GlowUp Beauty", email: "care@glowup.com" },
  { id: "seller-pet-supplies", name: "PetPal Supplies", businessName: "PetPal India", email: "info@petpal.in" },
  { id: "seller-auto-parts", name: "AutoGear Parts", businessName: "AutoGear Solutions", email: "sales@autogear.com" },
  { id: "seller-garden-tools", name: "GreenThumb Gardens", businessName: "GreenThumb Pvt Ltd", email: "help@greenthumb.in" },
  { id: "seller-toys-games", name: "PlayZone Toys", businessName: "PlayZone India", email: "orders@playzone.com" },
  { id: "seller-office-supplies", name: "OfficeMax Supplies", businessName: "OfficeMax India", email: "support@officemax.in" },
  { id: "seller-music-instruments", name: "MelodyMakers Music", businessName: "MelodyMakers Pvt Ltd", email: "contact@melodymakers.com" },
  { id: "seller-kitchen-appliances", name: "ChefPro Kitchen", businessName: "ChefPro India", email: "info@chefpro.in" },
  { id: "seller-mobile-accessories", name: "MobileMania Accessories", businessName: "MobileMania Pvt Ltd", email: "care@mobilemania.com" },
  { id: "seller-furniture-store", name: "FurniStyle Furniture", businessName: "FurniStyle India", email: "sales@furnistyle.in" },
  { id: "seller-jewelry-store", name: "GemCraft Jewelry", businessName: "GemCraft Pvt Ltd", email: "hello@gemcraft.com" },
  { id: "seller-health-wellness", name: "WellnessPro Health", businessName: "WellnessPro India", email: "support@wellnesspro.in" },
  { id: "seller-baby-products", name: "BabyBliss Products", businessName: "BabyBliss India", email: "info@babybliss.com" },
  { id: "seller-outdoor-gear", name: "AdventureZone Gear", businessName: "AdventureZone India", email: "orders@adventurezone.in" }
];

const PRODUCT_CATALOG = {
  "seller-electronics-hub": [
    { name: "Sony WH-1000XM5 Headphones", desc: "Premium noise-cancelling wireless headphones with 30hr battery", price: 29999, stock: 45, cat: "Consumer Electronics", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Sony+Headphones" },
    { name: "Samsung Galaxy Buds Pro", desc: "True wireless earbuds with ANC and 360° audio", price: 14999, stock: 78, cat: "Mobile & Accessories", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Galaxy+Buds" },
    { name: "Apple AirPods Pro 2", desc: "Advanced noise cancellation with adaptive audio", price: 24999, stock: 32, cat: "Consumer Electronics", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=AirPods+Pro" },
    { name: "Dell 27\" 4K Monitor", desc: "Ultra HD IPS display with HDR support", price: 34999, stock: 23, cat: "Consumer Electronics", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Dell+Monitor" },
    { name: "Logitech MX Master 3S", desc: "Advanced wireless mouse for productivity", price: 8999, stock: 67, cat: "Consumer Electronics", img: "https://via.placeholder.com/300x300/417505/ffffff?text=MX+Master" },
    { name: "iPad Air 5th Gen 256GB", desc: "10.9\" Liquid Retina display with M1 chip", price: 64999, stock: 18, cat: "Consumer Electronics", img: "https://via.placeholder.com/300x300/9013FE/ffffff?text=iPad+Air" }
  ],
  "seller-fashion-store": [
    { name: "Levi's 501 Original Jeans", desc: "Classic straight fit denim jeans", price: 3999, stock: 120, cat: "Clothing", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Levis+Jeans" },
    { name: "Nike Air Max 270", desc: "Men's lifestyle and running shoes", price: 12999, stock: 85, cat: "Clothing", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Nike+Shoes" },
    { name: "Zara Slim Fit Blazer", desc: "Professional navy blue blazer for men", price: 5999, stock: 45, cat: "Clothing", img: "https://via.placeholder.com/300x300/000000/ffffff?text=Zara+Blazer" },
    { name: "H&M Cotton T-Shirt Pack", desc: "Pack of 3 premium cotton t-shirts", price: 1499, stock: 200, cat: "Clothing", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=H%26M+Tshirts" },
    { name: "Adidas Track Pants", desc: "Comfortable athletic track pants", price: 2499, stock: 95, cat: "Clothing", img: "https://via.placeholder.com/300x300/417505/ffffff?text=Adidas+Pants" }
  ],
  "seller-grocery-fresh": [
    { name: "Organic Red Apples (1kg)", desc: "Farm-fresh organic apples from Himachal", price: 180, stock: 500, cat: "Fruits & Vegetables", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Red+Apples" },
    { name: "Fresh Spinach Bunch", desc: "Locally grown fresh spinach", price: 40, stock: 350, cat: "Fruits & Vegetables", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Spinach" },
    { name: "Basmati Rice 5kg", desc: "Premium aged basmati rice", price: 650, stock: 280, cat: "General Grocery", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Basmati+Rice" },
    { name: "Tata Salt 1kg", desc: "Iodized vacuum evaporated salt", price: 22, stock: 800, cat: "General Grocery", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Tata+Salt" },
    { name: "Amul Butter 500g", desc: "Fresh and pure butter from Amul", price: 260, stock: 420, cat: "General Grocery", img: "https://via.placeholder.com/300x300/F8E71C/ffffff?text=Amul+Butter" }
  ],
  "seller-home-decor": [
    { name: "Canvas Wall Art Set", desc: "3-piece modern abstract canvas prints", price: 2999, stock: 35, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Wall+Art" },
    { name: "LED String Lights 10m", desc: "Warm white decorative fairy lights", price: 599, stock: 150, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/F8E71C/ffffff?text=LED+Lights" },
    { name: "Ceramic Vase Set", desc: "Set of 3 decorative ceramic vases", price: 1499, stock: 48, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/50E3C2/ffffff?text=Vase+Set" },
    { name: "Throw Pillow Covers 5pcs", desc: "Cotton cushion covers with zippers", price: 899, stock: 95, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Pillows" }
  ],
  "seller-sports-gear": [
    { name: "Yoga Mat 6mm Thick", desc: "Non-slip exercise yoga mat with bag", price: 899, stock: 180, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/9013FE/ffffff?text=Yoga+Mat" },
    { name: "Dumbbells Set 20kg", desc: "Adjustable dumbbells with stand", price: 3499, stock: 42, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/417505/ffffff?text=Dumbbells" },
    { name: "Nike Gym Bag", desc: "Large sports duffle bag 60L", price: 2299, stock: 67, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Gym+Bag" },
    { name: "Resistance Bands Set", desc: "5 bands with different resistance levels", price: 699, stock: 125, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Bands" }
  ],
  "seller-books-store": [
    { name: "Atomic Habits by James Clear", desc: "Bestselling self-improvement book", price: 499, stock: 85, cat: "Books & Stationery", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Atomic+Habits" },
    { name: "The Psychology of Money", desc: "Financial wisdom by Morgan Housel", price: 399, stock: 92, cat: "Books & Stationery", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Psychology" },
    { name: "Harry Potter Complete Set", desc: "All 7 books boxed set", price: 3999, stock: 28, cat: "Books & Stationery", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Harry+Potter" },
    { name: "Notebook Bundle A5", desc: "Pack of 5 ruled notebooks", price: 299, stock: 340, cat: "Books & Stationery", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Notebooks" }
  ],
  "seller-beauty-care": [
    { name: "Lakme Lipstick Set", desc: "Set of 5 matte lipsticks", price: 1299, stock: 110, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Lipstick+Set" },
    { name: "Mamaearth Face Wash", desc: "Natural vitamin C face wash 100ml", price: 349, stock: 245, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Face+Wash" },
    { name: "Maybelline Mascara", desc: "Lash sensational volumizing mascara", price: 599, stock: 158, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/000000/ffffff?text=Mascara" },
    { name: "The Body Shop Body Butter", desc: "Shea body butter 200ml", price: 1095, stock: 78, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/F8E71C/ffffff?text=Body+Butter" }
  ],
  "seller-pet-supplies": [
    { name: "Pedigree Dog Food 10kg", desc: "Complete nutrition for adult dogs", price: 1899, stock: 95, cat: "Pet Supplies", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Dog+Food" },
    { name: "Cat Litter Box", desc: "Covered litter pan with scoop", price: 1299, stock: 45, cat: "Pet Supplies", img: "https://via.placeholder.com/300x300/50E3C2/ffffff?text=Litter+Box" },
    { name: "Pet Grooming Kit", desc: "5-in-1 grooming tools for dogs & cats", price: 899, stock: 67, cat: "Pet Supplies", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Grooming" }
  ],
  "seller-auto-parts": [
    { name: "Car Vacuum Cleaner", desc: "Portable handheld car vacuum 12V", price: 1499, stock: 82, cat: "Automotive", img: "https://via.placeholder.com/300x300/417505/ffffff?text=Vacuum" },
    { name: "Bosch Wiper Blades", desc: "Universal fit windshield wipers 24\"", price: 699, stock: 125, cat: "Automotive", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Wipers" },
    { name: "Car Phone Mount", desc: "Magnetic dashboard phone holder", price: 399, stock: 210, cat: "Automotive", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Phone+Mount" }
  ],
  "seller-garden-tools": [
    { name: "Garden Tool Set 10pcs", desc: "Complete gardening tools kit with bag", price: 1799, stock: 58, cat: "Gardening Supplies", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Garden+Tools" },
    { name: "Watering Can 10L", desc: "Large capacity plastic watering can", price: 499, stock: 140, cat: "Gardening Supplies", img: "https://via.placeholder.com/300x300/50E3C2/ffffff?text=Watering+Can" },
    { name: "Plant Seeds Variety Pack", desc: "20 types of flower and vegetable seeds", price: 699, stock: 95, cat: "Gardening Supplies", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Seeds" }
  ],
  "seller-toys-games": [
    { name: "LEGO Classic Creative Bricks", desc: "790 pieces creative building set", price: 3999, stock: 62, cat: "Toys & Games", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=LEGO" },
    { name: "Hot Wheels 20 Car Pack", desc: "Die-cast metal toy cars bundle", price: 1899, stock: 88, cat: "Toys & Games", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Hot+Wheels" },
    { name: "Monopoly Board Game", desc: "Classic family board game", price: 1299, stock: 74, cat: "Toys & Games", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Monopoly" }
  ],
  "seller-office-supplies": [
    { name: "HP LaserJet Printer", desc: "Wireless monochrome laser printer", price: 12999, stock: 32, cat: "Office Supplies", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Printer" },
    { name: "Office Chair Ergonomic", desc: "Adjustable mesh back office chair", price: 7999, stock: 28, cat: "Office Supplies", img: "https://via.placeholder.com/300x300/000000/ffffff?text=Chair" },
    { name: "Stapler & Punch Set", desc: "Heavy duty desk organizer set", price: 699, stock: 185, cat: "Office Supplies", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Stapler" }
  ],
  "seller-music-instruments": [
    { name: "Yamaha Acoustic Guitar", desc: "F310 beginner acoustic guitar", price: 9999, stock: 24, cat: "Musical Instruments", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Guitar" },
    { name: "Roland Digital Piano", desc: "88-key weighted keyboard", price: 45999, stock: 8, cat: "Musical Instruments", img: "https://via.placeholder.com/300x300/000000/ffffff?text=Piano" },
    { name: "Ukulele Starter Kit", desc: "Soprano ukulele with bag and tuner", price: 2499, stock: 42, cat: "Musical Instruments", img: "https://via.placeholder.com/300x300/50E3C2/ffffff?text=Ukulele" }
  ],
  "seller-kitchen-appliances": [
    { name: "Philips Air Fryer XL", desc: "Digital airfryer 6.2L capacity", price: 12999, stock: 38, cat: "Kitchen Appliances", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Air+Fryer" },
    { name: "Inalsa Mixer Grinder", desc: "750W mixer with 3 jars", price: 3499, stock: 68, cat: "Kitchen Appliances", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Mixer" },
    { name: "Prestige Induction Cooktop", desc: "1600W induction stove with timer", price: 2299, stock: 85, cat: "Kitchen Appliances", img: "https://via.placeholder.com/300x300/417505/ffffff?text=Induction" }
  ],
  "seller-mobile-accessories": [
    { name: "Anker PowerBank 20000mAh", desc: "Fast charging portable battery", price: 2999, stock: 125, cat: "Mobile & Accessories", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=PowerBank" },
    { name: "Spigen Phone Case", desc: "Rugged armor case for iPhone 14", price: 1299, stock: 210, cat: "Mobile & Accessories", img: "https://via.placeholder.com/300x300/000000/ffffff?text=Case" },
    { name: "Belkin USB-C Cable 2m", desc: "Braided fast charging cable", price: 899, stock: 340, cat: "Mobile & Accessories", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Cable" }
  ],
  "seller-furniture-store": [
    { name: "3-Seater Fabric Sofa", desc: "Modern grey fabric sofa with cushions", price: 24999, stock: 15, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/7ED321/ffffff?text=Sofa" },
    { name: "Wooden Study Table", desc: "Compact computer desk with drawer", price: 5999, stock: 32, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Study+Table" },
    { name: "Queen Size Bed Frame", desc: "Solid wood bed with headboard storage", price: 18999, stock: 18, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Bed" }
  ],
  "seller-jewelry-store": [
    { name: "Gold Plated Necklace", desc: "22k gold plated chain with pendant", price: 2499, stock: 48, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/F8E71C/ffffff?text=Necklace" },
    { name: "Silver Earrings Set", desc: "Sterling silver stud earrings", price: 1299, stock: 82, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/50E3C2/ffffff?text=Earrings" },
    { name: "Diamond Ring", desc: "Solitaire diamond engagement ring", price: 45999, stock: 12, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Ring" }
  ],
  "seller-health-wellness": [
    { name: "Protein Powder 2kg", desc: "Whey protein isolate chocolate flavor", price: 3999, stock: 95, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/417505/ffffff?text=Protein" },
    { name: "Blood Pressure Monitor", desc: "Digital automatic BP machine", price: 1899, stock: 58, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=BP+Monitor" },
    { name: "Vitamin D3 Tablets", desc: "1000 IU daily supplement 120 caps", price: 499, stock: 220, cat: "Cosmetics & Personal Care", img: "https://via.placeholder.com/300x300/F8E71C/ffffff?text=Vitamins" }
  ],
  "seller-baby-products": [
    { name: "Baby Diaper Pack", desc: "Pampers newborn size 1 (82 count)", price: 1299, stock: 180, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/50E3C2/ffffff?text=Diapers" },
    { name: "Baby Stroller", desc: "Lightweight folding pram with canopy", price: 8999, stock: 22, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/BD10E0/ffffff?text=Stroller" },
    { name: "Baby Feeding Set", desc: "BPA-free bottles and utensils set", price: 1599, stock: 95, cat: "Home & Furniture", img: "https://via.placeholder.com/300x300/F5A623/ffffff?text=Feeding+Set" }
  ],
  "seller-outdoor-gear": [
    { name: "Camping Tent 4-Person", desc: "Waterproof dome tent with carry bag", price: 4999, stock: 35, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/417505/ffffff?text=Tent" },
    { name: "Hiking Backpack 60L", desc: "Large capacity trekking rucksack", price: 2999, stock: 48, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/4A90E2/ffffff?text=Backpack" },
    { name: "Sleeping Bag", desc: "3-season mummy sleeping bag", price: 1799, stock: 67, cat: "Sports Equipment", img: "https://via.placeholder.com/300x300/D0021B/ffffff?text=Sleeping+Bag" }
  ]
};

async function seed() {
  console.log("🌱 Seeding 20 sellers with products...\n");

  let totalProducts = 0;

  for (const seller of SELLERS) {
    // Create seller
    await ddb.send(new PutCommand({
      TableName: "marketos_sellers",
      Item: {
        sellerId: seller.id,
        name: seller.name,
        businessName: seller.businessName,
        email: seller.email,
        phone: "+91-9876543210",
        address: "123 Business Park, Mumbai, India",
        gstNumber: `GST${Math.random().toString().slice(2, 11)}`,
        verified: true,
        rating: (4.0 + Math.random()).toFixed(1),
        totalOrders: Math.floor(Math.random() * 500),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));

    // Create products
    const products = PRODUCT_CATALOG[seller.id] || [];
    for (const prod of products) {
      await ddb.send(new PutCommand({
        TableName: "marketos_products",
        Item: {
          productId: randomUUID(),
          sellerId: seller.id,
          name: prod.name,
          description: prod.desc,
          price: prod.price,
          stock: prod.stock,
          category: prod.cat,
          imageUrl: prod.img,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      totalProducts++;
    }

    console.log(`✅ ${seller.name}: ${products.length} products`);
  }

  console.log(`\n🎉 Successfully seeded ${SELLERS.length} sellers with ${totalProducts} products!`);
}

seed().catch(console.error);
