import { sellerApi } from '../services/rest';

export type Product = {
  productId: string;
  sellerId: string;
  name: string;
  price: number;
  quantity: number;
  imageKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

// GET /products?sellerId=...
export async function listProducts(params?: { sellerId?: string }) {
  const { data } = await sellerApi.get('/products', { params });
  return data as Product[];
}

// POST /products
export async function createProduct(p: Omit<Product, 'productId'|'createdAt'|'updatedAt'>) {
  const { data } = await sellerApi.post('/products', p);
  return data as Product;
}

// PUT /products/:id
export async function updateProduct(productId: string, patch: Partial<Product>) {
  const { data } = await sellerApi.put(`/products/${productId}`, patch);
  return data as Product;
}

// DELETE /products/:id
export async function deleteProduct(productId: string) {
  const { data } = await sellerApi.delete(`/products/${productId}`);
  return data as { ok: boolean };
}

/**
 * Get presigned upload URL for S3 (backend supports POST /presign)
 * Falls back to GET /presign?key=&contentType= if POST not available.
 */
export async function getUploadUrl(key: string, contentType: string) {
  try {
    const { data } = await sellerApi.post('/presign', { key, contentType });
    return data as { url: string; fields?: Record<string,string> };
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404 || status === 405) {
      const { data } = await sellerApi.get('/presign', { params: { key, contentType } });
      return data as { url: string; fields?: Record<string,string> };
    }
    throw e;
  }
}
