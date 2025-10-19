const API_BASE = 'http://localhost:3001'

export interface Seller {
  id: string
  sellerId: string
  businessName: string
  email: string
  revenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: string[]
  status: 'active' | 'pending' | 'suspended'
  joinedDate: string
  category: string
}

export interface Product {
  productId: string
  sellerId: string
  name: string
  description: string
  price: number
  stock: number
  sold: number
  category: string
  imageUrl?: string
  status: 'active' | 'out-of-stock' | 'discontinued'
}

export interface SellerStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageRating: number
  pendingSellers: number
  activeSellers: number
}

export async function getAllSellers(): Promise<Seller[]> {
  const response = await fetch(`${API_BASE}/admin/sellers`)
  if (!response.ok) throw new Error('Failed to fetch sellers')
  return response.json()
}

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/products/seller/${sellerId}`)
  if (!response.ok) throw new Error('Failed to fetch seller products')
  return response.json()
}

export async function getSellerOrders(sellerId: string) {
  const response = await fetch(`${API_BASE}/orders/seller/${sellerId}`)
  if (!response.ok) throw new Error('Failed to fetch seller orders')
  return response.json()
}

export async function getDashboardStats(): Promise<SellerStats> {
  const response = await fetch(`${API_BASE}/admin/stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}
