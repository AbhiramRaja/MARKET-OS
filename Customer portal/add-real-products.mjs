import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

// Manual mutation since codegen hasn't run yet
const CREATE_PRODUCT = `
  mutation CreateProduct(
    $name: String!
    $description: String
    $price: Float!
    $images: [String!]!
    $category: String
    $stock: Int
    $sellerId: String!
    $sellerName: String
    $rating: Float
    $tags: [String!]
    $isActive: Boolean
  ) {
    createProduct(input: {
      name: $name
      description: $description
      price: $price
      images: $images
      category: $category
      stock: $stock
      sellerId: $sellerId
      sellerName: $sellerName
      rating: $rating
      tags: $tags
      isActive: $isActive
    }) {
      id
      name
      price
      category
      stock
    }
  }
`;

const products = [
  {
    name: "iPhone 15 Pro Max",
    description: "Latest Apple flagship smartphone with A17 Pro chip, titanium design, and advanced camera system",
    price: 134900,
    images: ["https://images.unsplash.com/photo-1678685888221-cda959c6e5d2?w=400"],
    category: "Electronics",
    stock: 25,
    sellerId: "DEMO_SELLER",
    sellerName: "Tech Store",
    rating: 4.9,
    tags: ["smartphone", "iphone", "apple", "5g", "electronics"],
    isActive: true
  },
  {
    name: "MacBook Air M2",
    description: "Thin and light laptop with Apple M2 chip, 13.6-inch Liquid Retina display",
    price: 114900,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    category: "Electronics",
    stock: 15,
    sellerId: "DEMO_SELLER",
    sellerName: "Tech Store",
    rating: 4.8,
    tags: ["laptop", "macbook", "apple", "m2", "computer"],
    isActive: true
  },
  {
    name: "Nike Air Jordan 1 Retro",
    description: "Classic basketball sneakers with iconic design and premium leather",
    price: 14999,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    category: "Fashion",
    stock: 50,
    sellerId: "DEMO_SELLER",
    sellerName: "Sneaker Store",
    rating: 4.7,
    tags: ["shoes", "sneakers", "nike", "jordan", "basketball", "fashion"],
    isActive: true
  },
  {
    name: "Sony WH-1000XM5",
    description: "Premium wireless noise cancelling headphones with industry-leading ANC",
    price: 29990,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400"],
    category: "Electronics",
    stock: 30,
    sellerId: "DEMO_SELLER",
    sellerName: "Audio Shop",
    rating: 4.9,
    tags: ["headphones", "wireless", "sony", "noise-cancelling", "audio"],
    isActive: true
  },
  {
    name: "Levi's 511 Slim Fit Jeans",
    description: "Classic slim fit denim jeans in dark blue wash",
    price: 4999,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
    category: "Fashion",
    stock: 100,
    sellerId: "DEMO_SELLER",
    sellerName: "Fashion Store",
    rating: 4.6,
    tags: ["jeans", "denim", "levis", "pants", "fashion"],
    isActive: true
  },
  {
    name: "Samsung 55\" 4K Smart TV",
    description: "Crystal UHD 4K TV with HDR, smart features, and stunning picture quality",
    price: 54990,
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"],
    category: "Electronics",
    stock: 20,
    sellerId: "DEMO_SELLER",
    sellerName: "Electronics Hub",
    rating: 4.7,
    tags: ["tv", "samsung", "4k", "smart-tv", "electronics"],
    isActive: true
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Responsive running shoes with Boost cushioning technology",
    price: 17999,
    images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400"],
    category: "Sports",
    stock: 60,
    sellerId: "DEMO_SELLER",
    sellerName: "Sports Store",
    rating: 4.8,
    tags: ["shoes", "running", "adidas", "ultraboost", "sports"],
    isActive: true
  },
  {
    name: "The Alchemist by Paulo Coelho",
    description: "International bestseller about following your dreams",
    price: 399,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
    category: "Books",
    stock: 150,
    sellerId: "DEMO_SELLER",
    sellerName: "Book Store",
    rating: 4.9,
    tags: ["book", "fiction", "bestseller", "paulo-coelho"],
    isActive: true
  },
  {
    name: "Dyson V15 Detect Vacuum",
    description: "Powerful cordless vacuum with laser dust detection",
    price: 59990,
    images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400"],
    category: "Home",
    stock: 12,
    sellerId: "DEMO_SELLER",
    sellerName: "Home Appliances",
    rating: 4.8,
    tags: ["vacuum", "dyson", "cordless", "home", "appliances"],
    isActive: true
  },
  {
    name: "PlayStation 5",
    description: "Next-gen gaming console with stunning graphics and ultra-fast SSD",
    price: 54990,
    images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400"],
    category: "Electronics",
    stock: 8,
    sellerId: "DEMO_SELLER",
    sellerName: "Gaming Store",
    rating: 4.9,
    tags: ["gaming", "playstation", "ps5", "console", "electronics"],
    isActive: true
  }
];

async function addProducts() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Adding Products to AppSync GraphQL Database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    try {
      const response = await client.graphql({
        query: CREATE_PRODUCT,
        variables: product
      });
      
      console.log(`✅ Added: ${product.name} - ₹${product.price.toLocaleString()}`);
      successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed: ${product.name}`);
      console.error(`   Error: ${error.errors?.[0]?.message || error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully added: ${successCount} products`);
  console.log(`   ❌ Failed: ${errorCount} products`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (successCount > 0) {
    console.log('🎉 SUCCESS! Products are now in the database!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open Customer Portal: http://localhost:3000');
    console.log('   2. Wait 30 seconds for auto-refresh');
    console.log('   3. You should see REAL PRODUCTS (no more mock data!)');
    console.log('\n✨ Test features:');
    console.log('   • Browse products on home page');
    console.log('   • Search by name or category');
    console.log('   • Filter by price, category, rating');
    console.log('   • Try visual search with product images');
    console.log('\n🎊 Congratulations! Your marketplace is live with real data!');
  } else {
    console.log('⚠️  No products were added successfully.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check if AppSync API is accessible');
    console.log('   - Verify API key in aws-exports.js');
    console.log('   - Check network connection');
  }
}

addProducts();
