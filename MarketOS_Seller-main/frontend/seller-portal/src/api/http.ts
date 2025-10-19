import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const baseURL = `${import.meta.env.VITE_API_BASE}/api`;
export const http = axios.create({ baseURL, withCredentials: true });

http.interceptors.request.use(async (cfg) => {
  const token = (await fetchAuthSession()).tokens?.idToken?.toString();
  if (token) cfg.headers.Authorization = token;
  return cfg;
});
