import { sellerApi } from '../services/rest';

export type Seller = {
  sellerId: string;
  businessName: string;
  email?: string;
  phone?: string;
  sellerType?: 'online' | 'offline';
  taxId?: string;
  logoKey?: string;
};

export async function getMySeller(): Promise<Seller | null> {
  try {
    const { data } = await sellerApi.get('/sellers/me');
    return data as Seller;
  } catch (e: any) {
    const st = e?.response?.status;
    if (st === 404) return null;
    throw e;
  }
}

/**
 * Some backends expect different keys for the seller name.
 * Try, in order:
 * 1) { businessName }
 * 2) { sellerName }
 * 3) { name }
 */
export async function createSeller(input: Omit<Seller, 'sellerId'>) {
  const base = {
    email: input.email,
    phone: input.phone,
    sellerType: input.sellerType,
    taxId: input.taxId,
    logoKey: input.logoKey,
  };

  // attempt 1: businessName
  try {
    const { data } = await sellerApi.post('/sellers', { ...base, businessName: input.businessName });
    return data as Seller;
  } catch (e1: any) {
    if ((e1?.response?.status || 0) !== 400) throw decorateError(e1);
    // attempt 2: sellerName
    try {
      const { data } = await sellerApi.post('/sellers', { ...base, sellerName: input.businessName });
      return data as Seller;
    } catch (e2: any) {
      if ((e2?.response?.status || 0) !== 400) throw decorateError(e2);
      // attempt 3: name
      try {
        const { data } = await sellerApi.post('/sellers', { ...base, name: input.businessName });
        return data as Seller;
      } catch (e3: any) {
        throw decorateError(e3);
      }
    }
  }
}

export async function updateSeller(sellerId: string, payload: Partial<Seller>) {
  const { data } = await sellerApi.put(`/sellers/${sellerId}`, payload);
  return data as Seller;
}

function decorateError(e: any) {
  const st = e?.response?.status;
  const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Unknown error';
  const err = new Error(`Seller API ${st || ''} ${String(msg)}`);
  // keep raw for console
  (err as any).raw = e;
  return err;
}
