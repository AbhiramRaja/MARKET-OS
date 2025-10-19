import axios from 'axios'
const BASE = import.meta.env.VITE_API_BASE as string
const SELLER_ID = import.meta.env.VITE_SELLER_ID as string
export async function listProducts(){ return (await axios.get(`${BASE}/api/products`,{params:{sellerId:SELLER_ID}})).data }
export async function createProduct(p:{name:string;price:number;images:string[]}){ return (await axios.post(`${BASE}/api/products`,{...p,sellerId:SELLER_ID})).data }
export async function deleteProduct(id:string){ await axios.delete(`${BASE}/api/products/${id}`) }
export async function getUploadUrl(key:string,contentType:string){ return (await axios.post(`${BASE}/api/upload-url`,{key,contentType})).data }
export async function listOrders(){ return (await axios.get(`${BASE}/api/orders`,{params:{sellerId:SELLER_ID}})).data }
export async function updateOrderStatus(id:string,status:string){ return (await axios.put(`${BASE}/api/orders/${id}`,{status})).data }
