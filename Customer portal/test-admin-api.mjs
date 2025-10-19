// Quick test to fetch products from Admin Portal API
async function testAdminAPI() {
  try {
    console.log('🔍 Testing Admin Portal API...\n');
    
    const response = await fetch('https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod/products');
    
    if (response.ok) {
      const products = await response.json();
      console.log(`✅ SUCCESS! Found ${products.length} products\n`);
      
      if (products.length > 0) {
        console.log('📦 Sample products:');
        products.slice(0, 5).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name} - ₹${p.price} (${p.category || 'No category'})`);
        });
        
        console.log(`\n🎉 Customer Portal will now show these ${products.length} products!`);
        console.log('\n💡 Next steps:');
        console.log('   1. Customer Portal is already running at http://localhost:3000');
        console.log('   2. Refresh the page or wait 30 seconds');
        console.log('   3. Products will appear automatically!');
      }
    } else {
      console.error(`❌ API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAPI();
