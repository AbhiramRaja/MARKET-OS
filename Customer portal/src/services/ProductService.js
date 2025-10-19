import { generateClient } from 'aws-amplify/api';
import { API_ENDPOINTS, buildUrl, getAuthHeaders } from '../config/api';
import { fetchAuthSession } from '@aws-amplify/auth';

const client = generateClient();

async function restFetch(url, options = {}) {
  try {
    // Get Cognito JWT token if available
    let token = null;
    try {
      const session = await fetchAuthSession();
      token = session.tokens?.idToken?.toString();
    } catch (e) {
      // Not logged in, token remains null
    }
    // Inject Authorization header if token exists
    const headers = {
      ...(options.headers || {}),
      ...(token ? getAuthHeaders(token) : {})
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error('REST request failed: ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('REST fetch failed', err);
    throw err;
  }
}

// Product GraphQL operations
const createProductMutation = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      images
      category
      stock
      sellerId
      sellerName
      rating
      tags
      isActive
      createdAt
      updatedAt
    }
  }
`;

const updateProductMutation = `
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
      description
      price
      images
      category
      stock
      sellerId
      sellerName
      rating
      tags
      isActive
      createdAt
      updatedAt
    }
  }
`;

const deleteProductMutation = `
  mutation DeleteProduct($input: DeleteProductInput!) {
    deleteProduct(input: $input) {
      id
    }
  }
`;

const listProductsQuery = `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        price
        images
        category
        stock
        sellerId
        sellerName
        rating
        tags
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getProductQuery = `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      description
      price
      images
      category
      stock
      sellerId
      sellerName
      rating
      tags
      isActive
      createdAt
      updatedAt
    }
  }
`;

class ProductService {
  // Create a new product
  async createProduct(productData) {
    try {
      const response = await client.graphql({
        query: createProductMutation,
        variables: {
          input: {
            ...productData,
            isActive: productData.isActive !== undefined ? productData.isActive : true,
            rating: productData.rating || 0,
            stock: productData.stock || 0
          }
        }
      });
      return response.data.createProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update an existing product
  async updateProduct(id, productData) {
    try {
      const response = await client.graphql({
        query: updateProductMutation,
        variables: {
          input: {
            id,
            ...productData
          }
        }
      });
      return response.data.updateProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(id) {
    try {
      const response = await client.graphql({
        query: deleteProductMutation,
        variables: {
          input: { id }
        }
      });
      return response.data.deleteProduct;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get all products (with optional filters)
  async listProducts(filter = null, limit = 100) {
    // Try GraphQL first, then fall back to REST if that fails or returns empty
    try {
      const response = await client.graphql({
        query: listProductsQuery,
        variables: {
          filter,
          limit
        }
      });
      const items = response?.data?.listProducts?.items || [];
      if (items && items.length > 0) return items;
    } catch (error) {
      console.warn('GraphQL listProducts failed, will try REST fallback', error);
    }

    // REST fallback
    try {
      // build simple URL; optionally we could translate filter to query params
      const url = buildUrl(API_ENDPOINTS.PRODUCTS.LIST);
      const data = await restFetch(url);
      // normalize to items array
      if (Array.isArray(data)) return data;
      return data.items || [];
    } catch (err) {
      console.error('Error listing products via REST fallback:', err);
      throw err;
    }
  }

  // Get products by seller ID
  async getProductsBySeller(sellerId) {
    return this.listProducts({
      sellerId: { eq: sellerId }
    });
  }

  // Get active products only
  async getActiveProducts() {
    return this.listProducts({
      isActive: { eq: true }
    });
  }

  // Get products by category
  async getProductsByCategory(category) {
    return this.listProducts({
      category: { eq: category },
      isActive: { eq: true }
    });
  }

  // Get a single product by ID
  async getProduct(id) {
    try {
      const response = await client.graphql({
        query: getProductQuery,
        variables: { id }
      });
      const p = response?.data?.getProduct;
      if (p) return p;
    } catch (error) {
      console.warn('GraphQL getProduct failed, will try REST fallback', error);
    }

    // REST fallback
    try {
      const url = buildUrl(API_ENDPOINTS.PRODUCTS.GET, { id });
      const data = await restFetch(url);
      return data;
    } catch (err) {
      console.error('Error getting product via REST fallback:', err);
      throw err;
    }
  }

  // Search products by name
  async searchProducts(searchTerm) {
    return this.listProducts({
      name: { contains: searchTerm },
      isActive: { eq: true }
    });
  }

  // Subscribe to product create/update/delete events.
  // Tries AppSync subscriptions via Amplify.API.graphql first. If that fails
  // (for example when WebSocket subscriptions aren't available for API_KEY auth),
  // falls back to a simple polling loop that calls listProducts every `intervalMs`.
  // Returns an object { unsubscribe }.
  subscribeToProductChanges(callback, { sellerId = null, intervalMs = 3000 } = {}) {
    // Try AppSync subscription (onCreateProduct / onUpdateProduct / onDeleteProduct)
    try {
      // build subscription query strings inline to avoid depending on generated file
      const onCreate = `subscription OnCreateProduct($filter: ModelSubscriptionProductFilterInput) {\n  onCreateProduct(filter: $filter) {\n    id\n    name\n    description\n    price\n    images\n    category\n    stock\n    sellerId\n    sellerName\n    rating\n    tags\n    isActive\n    createdAt\n    updatedAt\n  }\n}`;
      const onUpdate = `subscription OnUpdateProduct($filter: ModelSubscriptionProductFilterInput) {\n  onUpdateProduct(filter: $filter) {\n    id\n    name\n    description\n    price\n    images\n    category\n    stock\n    sellerId\n    sellerName\n    rating\n    tags\n    isActive\n    createdAt\n    updatedAt\n  }\n}`;
      const onDelete = `subscription OnDeleteProduct($filter: ModelSubscriptionProductFilterInput) {\n  onDeleteProduct(filter: $filter) {\n    id\n  }\n}`;

      const filter = sellerId ? { sellerId: { eq: sellerId } } : null;

      const subs = [];
      const client = generateClient();

      // create three subscriptions and call callback with unified shape { type, product }
      const subCreate = client.graphql({ query: onCreate, variables: { filter } });
      const subUpdate = client.graphql({ query: onUpdate, variables: { filter } });
      const subDelete = client.graphql({ query: onDelete, variables: { filter } });

      // Amplify.API.graphql returns an Observable when used with subscription queries
      const obsCreate = (subCreate && typeof subCreate.subscribe === 'function') ? subCreate : null;
      const obsUpdate = (subUpdate && typeof subUpdate.subscribe === 'function') ? subUpdate : null;
      const obsDelete = (subDelete && typeof subDelete.subscribe === 'function') ? subDelete : null;

      if (obsCreate || obsUpdate || obsDelete) {
        if (obsCreate) {
          subs.push(obsCreate.subscribe({
            next: data => callback({ type: 'create', product: data.value?.data?.onCreateProduct }),
            error: err => console.error('create subscription error', err)
          }));
        }
        if (obsUpdate) {
          subs.push(obsUpdate.subscribe({
            next: data => callback({ type: 'update', product: data.value?.data?.onUpdateProduct }),
            error: err => console.error('update subscription error', err)
          }));
        }
        if (obsDelete) {
          subs.push(obsDelete.subscribe({
            next: data => callback({ type: 'delete', product: data.value?.data?.onDeleteProduct }),
            error: err => console.error('delete subscription error', err)
          }));
        }

        return {
          unsubscribe: () => subs.forEach(s => s.unsubscribe && s.unsubscribe())
        };
      }
    } catch (e) {
      // fallthrough to polling fallback
      console.warn('AppSync subscription setup failed, falling back to polling:', e);
    }

    // Polling fallback: periodically call listProducts and diff
    let stopped = false;
    let lastMap = new Map();

    const doPoll = async () => {
      if (stopped) return;
      try {
        const items = await this.getActiveProducts();
        const map = new Map(items.map(i => [i.id, i]));

        // detect creates and updates
        for (const [id, item] of map.entries()) {
          if (!lastMap.has(id)) {
            callback({ type: 'create', product: item });
          } else {
            const prev = lastMap.get(id);
            if (JSON.stringify(prev) !== JSON.stringify(item)) {
              callback({ type: 'update', product: item });
            }
          }
        }

        // detect deletes
        for (const id of lastMap.keys()) {
          if (!map.has(id)) callback({ type: 'delete', product: { id } });
        }

        lastMap = map;
      } catch (err) {
        console.warn('Polling products failed', err);
      } finally {
        if (!stopped) setTimeout(doPoll, intervalMs);
      }
    };

    // start polling immediately
    doPoll();

    return { unsubscribe: () => { stopped = true; } };
  }
}

export default new ProductService();
