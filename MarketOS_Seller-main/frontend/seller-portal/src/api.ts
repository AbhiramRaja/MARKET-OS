import { sellerApi } from './services/rest';

export type Order = {
  orderId: string;
  sellerId: string;
  status: string;
  updatedAt?: string;
};

export async function listOrders(params?: { sellerId?: string }) {
  const { data } = await sellerApi.get('/orders', { params });
  return data as Order[];
}

export async function updateOrderStatus(id: string, status: string) {
  const { data } = await sellerApi.put(`/orders/${id}`, { status });
  return data as Order;
}

// convenience
export async function getMe() {
  const { data } = await sellerApi.get('/sellers/me');
  return data;
}
