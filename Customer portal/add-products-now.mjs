import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

//Using ProductService which already has the mutation defined
import ProductService from './src/services/ProductService.js';

const testProducts = [
  {
    name: "iPhone 15 Pro Max",
    description: "Latest Apple flagship with A17 Pro chip",
    price: 134900,
    images: ["https://images.unsplash.com/photo-1678685888221-cda959c6e5d2?w=400"],
    category: "Electronics",
    stock: 25,
    sellerId: "DEMO_SELLER",
    sellerName: "Tech Store",
    rating: 4.9,
    tags: ["smartphone", "iphone", "apple"],
    isActive: true
  },
  {
    name: "MacBook Air M2",
    description: "Thin and light laptop with M2 chip",
    price: 114900,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    category: "Electronics",
    stock: 15,
    sellerId: "DEMO_SELLER",
    sellerName: "Tech Store",
    rating: 4.8,
    tags: ["laptop", "macbook", "apple"],
    isActive: true
  },
  {
    name: "Nike Air Jordan 1",
    description: "Classic basketball sneakers",
    price: 14999,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    category: "Fashion",
    stock: 50,
    sellerId: "DEMO_SELLER",
    sellerName: "Sneaker Store",
    rating: 4.7,
    tags: ["shoes", "sneakers", "nike"],
    isActive: true
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Premium noise cancelling headphones",
    price: 29990,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400"],
    category: "Electronics",
    stock: 30,
    sellerId: "DEMO_SELLER",
    sellerName: "Audio Shop",
    rating: 4.9,
    tags: ["headphones", "wireless", "sony"],
    isActive: true
  },
  {
    name: "Levi's 511 Slim Jeans",
    description: "Classic slim fit denim",
    price: 4999,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
    category: "Fashion",
    stock: 100,
    sellerId: "DEMO_SELLER",
    sellerName: "Fashion Store",
    rating: 4.6,
    tags: ["jeans", "denim", "levis"],
    isActive: true
  },
];

async function addProducts() {
  console.log('🚀 Adding products using ProductService...\n');
  
  let success = 0;
  for (const product of testProducts) {
    try {
      await ProductService.createProduct(product);
      console.log(`✅ Added: ${product.name}`);
      success++;
      await new Promise(r => setTimeout(r, 300));
    } catch (error) {
      console.error(`❌ Failed: ${product.name}`, error.message);
    }
  }
  
  console.log(`\n🎉 Success! Added ${success}/${testProducts.length} products`);
  console.log('\n💡 Open Customer Portal: http://localhost:3000');
  console.log('   Products will appear in ~30 seconds!');
}

addProducts();
