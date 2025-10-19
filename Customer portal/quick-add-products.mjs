import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

const createProductMutation = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
      category
    }
  }
`;

// Quick test products to verify AppSync integration
const testProducts = [
  {
    name: "iPhone 15 Pro Max",
    description: "Latest Apple flagship smartphone with A17 Pro chip, titanium design",
    price: 134900,
    images: ["https://images.unsplash.com/photo-1678685888221-cda959c6e5d2?w=400"],
    category: "Electronics",
    stock: 25,
    sellerId: "QUICK_TEST",
    sellerName: "Test Store",
    rating: 4.9,
    tags: ["smartphone", "iphone", "apple", "5g"],
    isActive: true
  },
  {
    name: "MacBook Air M2",
    description: "Thin and light laptop with Apple M2 chip, 13.6-inch display",
    price: 114900,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    category: "Electronics",
    stock: 15,
    sellerId: "QUICK_TEST",
    sellerName: "Test Store",
    rating: 4.8,
    tags: ["laptop", "macbook", "apple", "m2"],
    isActive: true
  },
  {
    name: "Nike Air Jordan 1",
    description: "Classic basketball sneakers with iconic design",
    price: 14999,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    category: "Fashion",
    stock: 50,
    sellerId: "QUICK_TEST",
    sellerName: "Sneaker Store",
    rating: 4.7,
    tags: ["shoes", "sneakers", "nike", "jordan", "basketball"],
    isActive: true
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancelling wireless headphones",
    price: 29990,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400"],
    category: "Electronics",
    stock: 30,
    sellerId: "QUICK_TEST",
    sellerName: "Audio Shop",
    rating: 4.9,
    tags: ["headphones", "wireless", "sony", "noise-cancelling"],
    isActive: true
  },
  {
    name: "Levi's 511 Slim Jeans",
    description: "Classic slim fit denim jeans",
    price: 4999,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
    category: "Fashion",
    stock: 100,
    sellerId: "QUICK_TEST",
    sellerName: "Fashion Store",
    rating: 4.6,
    tags: ["jeans", "denim", "levis", "pants"],
    isActive: true
  },
  {
    name: "Samsung 4K Smart TV 55\"",
    description: "Crystal UHD 4K TV with smart features and HDR",
    price: 54990,
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"],
    category: "Electronics",
    stock: 20,
    sellerId: "QUICK_TEST",
    sellerName: "Electronics Hub",
    rating: 4.7,
    tags: ["tv", "samsung", "4k", "smart-tv"],
    isActive: true
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Responsive running shoes with boost cushioning",
    price: 17999,
    images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400"],
    category: "Sports",
    stock: 60,
    sellerId: "QUICK_TEST",
    sellerName: "Sports Store",
    rating: 4.8,
    tags: ["shoes", "running", "adidas", "ultraboost"],
    isActive: true
  },
  {
    name: "The Alchemist - Paulo Coelho",
    description: "Bestselling novel about following your dreams",
    price: 399,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
    category: "Books",
    stock: 150,
    sellerId: "QUICK_TEST",
    sellerName: "Book Store",
    rating: 4.9,
    tags: ["book", "fiction", "bestseller"],
    isActive: true
  }
];

async function addTestProducts() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Adding Test Products to AppSync GraphQL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of testProducts) {
    try {
      const response = await client.graphql({
        query: createProductMutation,
        variables: { input: product }
      });
      
      console.log(`✅ Added: ${product.name} - ₹${product.price}`);
      successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Failed: ${product.name}`);
      console.error(`   Error: ${error.errors?.[0]?.message || error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (successCount > 0) {
    console.log('🎉 Success! Products added to database!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open Customer Portal: http://localhost:3000');
    console.log('   2. Wait 30 seconds for auto-refresh');
    console.log('   3. Products should appear (no more mock data!)');
    console.log('\n✨ Real products are now live!');
  } else {
    console.log('⚠️  No products were added. Check errors above.');
  }
}

addTestProducts();
