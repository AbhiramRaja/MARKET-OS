import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export type Order = { 
  orderId: string;
  status: string;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  productId: string;
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  createdAt?: string;
};

// Get auth token
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.warn('No auth session:', error);
    return {};
  }
}

// Helper function for fetch requests
async function request(path: string, opts: RequestInit = {}) {
  const url = API_BASE.replace(/\/$/, '') + path;
  const authHeaders = await getAuthHeaders();
  
  const res = await fetch(url, {
    ...opts,
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(opts.headers as Record<string, string> || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// Order functions
export async function listOrders(): Promise<Order[]> {
  return request('/orders');
}

export async function updateOrderStatus(id: string, status: 'PACKED'|'SHIPPED'|'DELIVERED'): Promise<Order> {
  const authHeaders = await getAuthHeaders();
  const res = await axios.put(`${API_BASE}/orders/${id}`, { status }, {
    headers: authHeaders
  });
  return res.data as Order;
}

export async function createOrder(payload: {
  sellerId?: string;
  items: { productId: string; qty: number }[];
  meta?: any;
}) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Product functions
export async function listProducts(): Promise<Product[]> {
  return request('/products');
}

export async function createProduct(payload: {
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}): Promise<Product> {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(productId: string, payload: {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}): Promise<Product> {
  return request(`/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  return request(`/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}
