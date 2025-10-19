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
        images
      }
      nextToken
    }
  }
`;

async function testProducts() {
  try {
    console.log('🔍 Fetching products from AppSync...\n');
    const response = await client.graphql({
      query: listProductsQuery
    });
    
    const products = response.data.listProducts.items;
    
    console.log(`✅ Found ${products.length} products in database\n`);
    
    if (products.length > 0) {
      console.log('📦 Sample products:');
      products.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ₹${p.price} (${p.category || 'No category'})`);
      });
    } else {
      console.log('⚠️  No products found in database!');
      console.log('💡 Add products via Admin Portal at http://localhost:5173');
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
  }
}

testProducts();
