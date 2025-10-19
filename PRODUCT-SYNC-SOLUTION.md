# 🔄 Product Sync Solution

## Problem Identified ✅

You have **TWO SEPARATE databases**:

1. **Admin Portal** (localhost:5173/5174):
   - Uses REST API: `https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod`
   - Has 37 products
   - Requires authentication

2. **Customer Portal** (localhost:3000):
   - Uses AppSync GraphQL: `https://5hdgfvi4dfbffm7w6jc4lxmq4i.appsync-api.ap-south-1.amazonaws.com/graphql`
   - Has 0 products (empty database)
   - This is why you see mock data!

---

## Solution Options

### **Option 1: Use Seller Portal (Recommended) 🎯**

The **Seller Portal** (localhost:3002) is already configured to use AppSync GraphQL!

**Steps:**
1. Open Seller Portal: http://localhost:3002
2. Login with credentials (if needed)
3. Navigate to Products section  
4. Click "Add Product"
5. Fill in product details and save
6. Product will appear in Customer Portal within 30 seconds!

**Why this works:**
- Seller Portal uses the same AppSync endpoint as Customer Portal
- Products created here sync automatically
- No authentication issues

---

### **Option 2: Import Products from Admin Portal**

Since Admin Portal has 37 products but they're in a different database, we need to:

**Manual Import:**
1. Open Admin Portal and export product list
2. Use the import script below to add them to AppSync

**Create import file:** `import-products-manually.mjs`

```javascript
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from './src/aws-exports.js';

Amplify.configure(awsExports);
const client = generateClient();

// Manually paste products from Admin Portal here
const productsToImport = [
  {
    name: "Keyboard - GadgetWorld",
    price: 822,
    category: "Electronics",
    stock: 29,
    sellerId: "seller_002",
    sellerName: "GadgetWorld",
    description: "High quality keyboard",
    images: ["https://via.placeholder.com/400"],
    rating: 4.5,
    tags: ["electronics", "keyboard", "gadget"],
    isActive: true
  },
  {
    name: "Surge Protector - GadgetWorld",
    price: 3275,
    category: "Electronics",
    stock: 71,
    sellerId: "seller_002",
    sellerName: "GadgetWorld",
    description: "Reliable surge protector",
    images: ["https://via.placeholder.com/400"],
    rating: 4.7,
    tags: ["electronics", "surge", "protector"],
    isActive: true
  },
  // Add more products here...
];

const createProductMutation = \`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
    }
  }
\`;

async function importProducts() {
  let success = 0;
  for (const product of productsToImport) {
    try {
      await client.graphql({
        query: createProductMutation,
        variables: { input: product }
      });
      console.log(\`✅ Imported: \${product.name}\`);
      success++;
    } catch (error) {
      console.error(\`❌ Failed: \${product.name}\`, error.message);
    }
  }
  console.log(\`\n🎉 Imported \${success}/\${productsToImport.length} products!\`);
}

importProducts();
```

---

### **Option 3: Quick Test Products 🚀**

Add a few test products quickly:

```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"
node quick-add-products.mjs
```

I'll create this script for you!

---

## Recommended Approach ⭐

**Use Seller Portal (localhost:3002) to add products:**

1. It's already configured with AppSync
2. No authentication issues
3. Products sync automatically to Customer Portal
4. Real-time updates work perfectly

**Then:**
- Products appear in Customer Portal within 30 seconds
- No more mock data!
- Full cross-portal sync working

---

## Why You See Mock Data

```javascript
// In Home.jsx and SearchResults.jsx:
const [products, setProducts] = useState(productsMock || []);

useEffect(() => {
  const fetchProducts = async () => {
    const items = await ProductService.getActiveProducts();
    if (items && items.length > 0) {
      setProducts(items);  // ← This line never executes because AppSync returns 0 products
    }
    // Falls back to productsMock
  };
}, []);
```

**Once you add products via Seller Portal**, this code will work and replace mock data!

---

## Next Steps

1. ✅ **Open Seller Portal**: http://localhost:3002
2. ✅ **Add Product**: Click "Add Product" button
3. ✅ **Fill Details**:
   - Name: "Test iPhone"
   - Price: 29999
   - Category: "Electronics"
   - Stock: 10
4. ✅ **Save**
5. ✅ **Check Customer Portal**: http://localhost:3000 (wait 30 seconds)

Products should appear!
