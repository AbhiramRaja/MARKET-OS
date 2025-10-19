import { sellerApi } from './services/rest';

export type Seller = {
  sellerId: string;
  businessName: string;
  email?: string;
  phone?: string;
  sellerType?: 'online' | 'offline';
  taxId?: string;
  logoKey?: string;
};

export async function getMySeller() {
  const res = await sellerApi.get('/sellers/me');
  return res.data as Seller;
}

export async function updateMySeller(partial: Partial<Seller>) {
  const res = await sellerApi.put('/sellers/me', partial);
  return res.data as Seller;
}
