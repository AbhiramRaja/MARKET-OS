import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

// Test with minimal required fields
const testMutation = `
  mutation CreateProduct(
    $name: String!
    $price: Float!
    $images: [String!]!
    $sellerId: String!
  ) {
    createProduct(input: {
      name: $name
      price: $price
      images: $images
      sellerId: $sellerId
      isActive: true
    }) {
      id
      name
      price
    }
  }
`;

async function testCreate() {
  try {
    console.log('Testing product creation...\n');
    const response = await client.graphql({
      query: testMutation,
      variables: {
        name: "Test iPhone",
        price: 29999,
        images: ["https://via.placeholder.com/400"],
        sellerId: "TEST_SELLER"
      }
    });
    
    console.log('✅ Success!', response.data.createProduct);
  } catch (error) {
    console.error('❌ Error:', error.errors?.[0]?.message || error.message);
  }
}

testCreate();
