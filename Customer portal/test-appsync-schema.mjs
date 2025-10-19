import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

// Test if listProducts query exists
const LIST_PRODUCTS = `
  query ListProducts {
    listProducts {
      items {
        id
        name
        price
      }
    }
  }
`;

async function testSchema() {
  try {
    console.log('Testing if Product queries are available in AppSync...\n');
    const response = await client.graphql({
      query: LIST_PRODUCTS
    });
    
    console.log('✅ SUCCESS! Product model is deployed!');
    console.log(`Found ${response.data.listProducts.items.length} products\n`);
    
    if (response.data.listProducts.items.length > 0) {
      console.log('Sample products:');
      response.data.listProducts.items.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name}: ₹${p.price}`);
      });
    } else {
      console.log('⚠️  Database is empty but Product model exists!');
      console.log('This means we CAN add products, they just need to be created.');
    }
  } catch (error) {
    console.error('❌ Product model NOT deployed in AppSync');
    console.error('Error:', error.errors?.[0]?.message || error.message);
    console.log('\n💡 This means: Schema needs to be deployed with Product @model');
  }
}

testSchema();
