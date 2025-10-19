import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const baseURL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE;
export const sellerApi = axios.create({ baseURL, withCredentials: false });

sellerApi.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const id = session.tokens?.idToken?.toString() || '';
  config.headers = config.headers ?? {};
  // ⛳️ Send *bare* ID token only (this matched your earlier success path)
  if (id) config.headers.Authorization = id;
  return config;
});

sellerApi.interceptors.response.use(
  (r) => r,
  (e) => {
    const st = e?.response?.status;
    if (st === 401 || st === 403) {
      const sent = String(e?.config?.headers?.Authorization || '');
      console.warn('[sellerApi] 401/403 (ID bare)', {
        url: e?.config?.url, method: e?.config?.method, tokenLen: sent.length
      });
    }
    return Promise.reject(e);
  }
);
