import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

const listProductsQuery = `
  query ListProducts {
    listProducts(limit: 100) {
      items {
        id
        name
        price
        category
        stock
        isActive
      }
    }
  }
`;

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...\n');
    const response = await client.graphql({
      query: listProductsQuery
    });
    
    const products = response.data.listProducts.items;
    
    console.log(`📊 Total products: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('❌ NO PRODUCTS IN DATABASE!');
      console.log('\n💡 Solution: Add products via Admin Portal:');
      console.log('   1. Open http://localhost:5173 or http://localhost:5174');
      console.log('   2. Navigate to Products section');
      console.log('   3. Click "Add Product" or "Create Product"');
      console.log('   4. Fill in product details and save\n');
    } else {
      console.log('✅ Products found! Sample:');
      products.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ₹${p.price}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Check:');
    console.log('   - AppSync endpoint in aws-exports.js');
    console.log('   - API key is valid');
    console.log('   - Network connection');
  }
}

checkProducts();
