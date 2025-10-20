import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// In-memory storage with sample data
let sellers = new Map([
  ['seller1', { 
    sellerId: 'seller1', 
    businessName: 'TechGear Electronics', 
    email: 'tech@example.com',
    status: 'active', 
    joinedDate: '2024-01-15' 
  }],
  ['seller2', { 
    sellerId: 'seller2', 
    businessName: 'Fashion Trends', 
    email: 'fashion@example.com',
    status: 'active', 
    joinedDate: '2024-02-20' 
  }],
  ['seller3', { 
    sellerId: 'seller3', 
    businessName: 'Home Essentials Co', 
    email: 'home@example.com',
    status: 'active', 
    joinedDate: '2024-03-10' 
  }]
])

let products = new Map([
  ['prod1', { productId: 'prod1', sellerId: 'seller1', name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, stock: 150, sold: 45, category: 'Electronics', status: 'active' }],
  ['prod2', { productId: 'prod2', sellerId: 'seller1', name: 'USB-C Hub', description: '7-in-1 USB-C hub', price: 49.99, stock: 75, sold: 32, category: 'Electronics', status: 'active' }],
  ['prod3', { productId: 'prod3', sellerId: 'seller1', name: 'Laptop Stand', description: 'Aluminum laptop stand', price: 39.99, stock: 120, sold: 28, category: 'Accessories', status: 'active' }],
  ['prod4', { productId: 'prod4', sellerId: 'seller2', name: 'Summer Dress', description: 'Floral summer dress', price: 59.99, stock: 200, sold: 89, category: 'Clothing', status: 'active' }],
  ['prod5', { productId: 'prod5', sellerId: 'seller2', name: 'Denim Jeans', description: 'Classic blue jeans', price: 79.99, stock: 150, sold: 67, category: 'Clothing', status: 'active' }],
  ['prod6', { productId: 'prod6', sellerId: 'seller3', name: 'Coffee Maker', description: 'Programmable coffee maker', price: 89.99, stock: 80, sold: 54, category: 'Appliances', status: 'active' }],
  ['prod7', { productId: 'prod7', sellerId: 'seller3', name: 'Vacuum Cleaner', description: 'Cordless vacuum cleaner', price: 149.99, stock: 60, sold: 41, category: 'Appliances', status: 'active' }]
])

let orders = new Map([
  ['ord1', { orderId: 'ord1', sellerId: 'seller1', customerEmail: 'customer1@example.com', totalAmount: 109.97, status: 'delivered', createdAt: '2024-10-01T10:00:00Z', items: [{ productId: 'prod1', productName: 'Wireless Mouse', quantity: 2, price: 29.99 }, { productId: 'prod2', productName: 'USB-C Hub', quantity: 1, price: 49.99 }] }],
  ['ord2', { orderId: 'ord2', sellerId: 'seller1', customerEmail: 'customer2@example.com', totalAmount: 79.98, status: 'shipped', createdAt: '2024-10-05T14:30:00Z', items: [{ productId: 'prod3', productName: 'Laptop Stand', quantity: 2, price: 39.99 }] }],
  ['ord3', { orderId: 'ord3', sellerId: 'seller2', customerEmail: 'customer3@example.com', totalAmount: 239.96, status: 'delivered', createdAt: '2024-10-03T09:15:00Z', items: [{ productId: 'prod4', productName: 'Summer Dress', quantity: 4, price: 59.99 }] }],
  ['ord4', { orderId: 'ord4', sellerId: 'seller3', customerEmail: 'customer4@example.com', totalAmount: 329.96, status: 'pending', createdAt: '2024-10-10T16:45:00Z', items: [{ productId: 'prod6', productName: 'Coffee Maker', quantity: 2, price: 89.99 }, { productId: 'prod7', productName: 'Vacuum Cleaner', quantity: 1, price: 149.99 }] }]
])

// Seller endpoints
app.get('/seller/:sellerId', (req, res) => {
  const seller = sellers.get(req.params.sellerId)
  if (!seller) return res.status(404).json({ error: 'Seller not found' })
  res.json(seller)
})

app.post('/seller', (req, res) => {
  const { sellerId, businessName, email } = req.body
  const seller = { 
    sellerId, 
    businessName, 
    email: email || `${sellerId}@example.com`,
    status: 'active', 
    joinedDate: new Date().toISOString() 
  }
  sellers.set(sellerId, seller)
  res.json(seller)
})

// Product endpoints
app.get('/products/seller/:sellerId', (req, res) => {
  const sellerProducts = Array.from(products.values()).filter(p => p.sellerId === req.params.sellerId)
  res.json(sellerProducts)
})

app.post('/products', (req, res) => {
  const product = { ...req.body, productId: `prod${Date.now()}`, sold: 0, status: 'active' }
  products.set(product.productId, product)
  res.json(product)
})

app.put('/products/:productId', (req, res) => {
  const product = products.get(req.params.productId)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  const updated = { ...product, ...req.body }
  products.set(req.params.productId, updated)
  res.json(updated)
})

app.delete('/products/:productId', (req, res) => {
  products.delete(req.params.productId)
  res.json({ success: true })
})

// Order endpoints
app.get('/orders/seller/:sellerId', (req, res) => {
  const sellerOrders = Array.from(orders.values()).filter(o => o.sellerId === req.params.sellerId)
  res.json(sellerOrders)
})

app.post('/orders', (req, res) => {
  const order = { ...req.body, orderId: `ord${Date.now()}`, createdAt: new Date().toISOString() }
  orders.set(order.orderId, order)
  
  // Update product sold count and stock
  order.items.forEach((item: any) => {
    const product = products.get(item.productId)
    if (product) {
      product.sold += item.quantity
      product.stock -= item.quantity
      products.set(item.productId, product)
    }
  })
  
  res.json(order)
})

app.put('/orders/:orderId/status', (req, res) => {
  const order = orders.get(req.params.orderId)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  order.status = req.body.status
  orders.set(req.params.orderId, order)
  res.json(order)
})

// Admin endpoints
app.get('/admin/sellers', (req, res) => {
  const sellersData = Array.from(sellers.values()).map(seller => {
    const sellerOrders = Array.from(orders.values()).filter(o => o.sellerId === seller.sellerId)
    const revenue = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = sellerOrders.length
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0
    
    return {
      id: seller.sellerId,
      sellerId: seller.sellerId,
      businessName: seller.businessName,
      email: seller.email,
      revenue,
      totalOrders,
      averageOrderValue,
      status: seller.status,
      joinedDate: seller.joinedDate
    }
  })
  res.json(sellersData)
})

app.get('/admin/stats', (req, res) => {
  const allSellers = Array.from(sellers.values())
  const allOrders = Array.from(orders.values())
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalOrders = allOrders.length
  const totalProducts = products.size
  const activeSellers = allSellers.filter(s => s.status === 'active').length
  const pendingSellers = allSellers.filter(s => s.status === 'pending').length

  res.json({
    totalRevenue,
    totalOrders,
    totalProducts,
    activeSellers,
    pendingSellers,
    averageRating: 4.7
  })
})

const PORT = 3001
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
