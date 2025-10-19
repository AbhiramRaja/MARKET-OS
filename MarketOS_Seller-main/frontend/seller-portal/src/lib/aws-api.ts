// AWS API Client for Seller Portal
import { fetchAuthSession } from 'aws-amplify/auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://ux95pk83o4.execute-api.ap-south-1.amazonaws.com/prod'

async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  } catch (error) {
    return { 'Content-Type': 'application/json' }
  }
}

// Generic API call
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// Seller APIs
export async function getSellerProfile(sellerId: string) {
  return apiCall(`/sellers/${sellerId}`)
}

export async function updateSellerProfile(sellerId: string, data: any) {
  return apiCall(`/sellers/${sellerId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Products APIs
export async function getSellerProducts(sellerId: string) {
  return apiCall(`/products/seller/${sellerId}`)
}

export async function createProduct(sellerId: string, product: any) {
  return apiCall(`/products`, {
    method: 'POST',
    body: JSON.stringify({ ...product, sellerId })
  })
}

export async function updateProduct(productId: string, product: any) {
  return apiCall(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  })
}

export async function deleteProduct(productId: string) {
  return apiCall(`/products/${productId}`, { method: 'DELETE' })
}

// Orders APIs
export async function getSellerOrders(sellerId: string) {
  return apiCall(`/orders/seller/${sellerId}`)
}

export async function updateOrderStatus(orderId: string, status: string) {
  return apiCall(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
}

// Analytics APIs
export async function getSellerAnalytics(sellerId: string, period: string = '30d') {
  return apiCall(`/analytics/seller/${sellerId}?period=${period}`)
}

export async function getSalesTrends(sellerId: string, period: string = '7d') {
  return apiCall(`/analytics/seller/${sellerId}/trends?period=${period}`)
}

export async function getTopProducts(sellerId: string, limit: number = 5) {
  return apiCall(`/analytics/seller/${sellerId}/top-products?limit=${limit}`)
}

// Inventory APIs
export async function getLowStockProducts(sellerId: string, threshold: number = 10) {
  return apiCall(`/inventory/seller/${sellerId}/low-stock?threshold=${threshold}`)
}

export async function updateStock(productId: string, quantity: number) {
  return apiCall(`/inventory/${productId}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  })
}

export async function bulkUpdateProducts(updates: any[]) {
  return apiCall(`/inventory/bulk-update`, {
    method: 'POST',
    body: JSON.stringify({ updates })
  })
}

// Store Locations APIs
export async function getStoreLocations(sellerId: string) {
  return apiCall(`/stores/seller/${sellerId}`)
}

export async function createStoreLocation(sellerId: string, location: any) {
  return apiCall(`/stores`, {
    method: 'POST',
    body: JSON.stringify({ ...location, sellerId })
  })
}

export async function updateStoreLocation(storeId: string, location: any) {
  return apiCall(`/stores/${storeId}`, {
    method: 'PUT',
    body: JSON.stringify(location)
  })
}

export async function deleteStoreLocation(storeId: string) {
  return apiCall(`/stores/${storeId}`, { method: 'DELETE' })
}

// Image Upload to S3
export async function getPresignedUrl(fileName: string, fileType: string) {
  return apiCall(`/presign`, {
    method: 'POST',
    body: JSON.stringify({ fileName, fileType })
  })
}

export async function uploadImageToS3(file: File): Promise<string> {
  const { url, key } = await getPresignedUrl(file.name, file.type)
  
  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  })
  
  return `https://marketos-seller-assets-387686289729-ap-south-1.s3.ap-south-1.amazonaws.com/${key}`
}
