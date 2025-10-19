#!/usr/bin/env node

/**
 * Sync Products from Admin Portal Backend to AppSync GraphQL
 * 
 * Problem: Admin Portal stores products in REST API (localhost:3001)
 *          Customer Portal reads from AppSync GraphQL
 * 
 * Solution: Fetch products from REST API and create them in AppSync
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

// Configure AppSync (Customer Portal's database)
const awsConfig = {
  aws_project_region: 'ap-south-1',
  aws_appsync_graphqlEndpoint: 'https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql',
  aws_appsync_region: 'ap-south-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-4n647mlhincrzi3ia5qzrjgyie'
};

Amplify.configure(awsConfig);
const client = generateClient();

// Admin Portal's REST API
const ADMIN_API = 'https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod';

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

async function fetchAdminProducts() {
  try {
    console.log('🔍 Fetching products from Admin Portal backend...');
    const response = await fetch(`${ADMIN_API}/products`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const products = await response.json();
    console.log(`✅ Found ${products.length} products in Admin Portal\n`);
    return products;
  } catch (error) {
    console.error('❌ Failed to fetch from Admin Portal:', error.message);
    return [];
  }
}

async function syncProductToAppSync(product) {
  try {
    // Map Admin Portal product structure to AppSync Product type
    const input = {
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      images: product.image ? [product.image] : [],
      category: product.category || 'Uncategorized',
      stock: parseInt(product.stock) || 0,
      sellerId: product.sellerId || 'ADMIN_IMPORT',
      sellerName: product.sellerName || 'Imported from Admin',
      rating: parseFloat(product.rating) || 0,
      tags: product.tags || [],
      isActive: product.isActive !== false
    };
    
    const response = await client.graphql({
      query: createProductMutation,
      variables: { input }
    });
    
    return response.data.createProduct;
  } catch (error) {
    throw new Error(error.errors?.[0]?.message || error.message);
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Syncing Products: Admin Portal → Customer Portal');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Fetch products from Admin Portal
  const adminProducts = await fetchAdminProducts();
  
  if (adminProducts.length === 0) {
    console.log('⚠️  No products to sync');
    return;
  }
  
  // Sync each product to AppSync
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of adminProducts) {
    try {
      await syncProductToAppSync(product);
      console.log(`✅ Synced: ${product.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${product.name} - ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Sync Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (successCount > 0) {
    console.log('🎉 Products synced! Check Customer Portal:');
    console.log('   http://localhost:3000\n');
    console.log('💡 Products will appear within 30 seconds (auto-refresh)');
  }
}

main();
