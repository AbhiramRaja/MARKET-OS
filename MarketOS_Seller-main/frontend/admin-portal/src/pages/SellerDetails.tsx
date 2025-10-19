import { useState, useEffect } from 'react'
import { Seller, Product, getSellerProducts, getSellerOrders } from '../lib/api-client'
import ProductCard from '../components/ProductCard'

interface Props {
  seller: Seller
  onBack: () => void
}

interface Order {
  orderId: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
  products: Array<{ productId: string; name: string; quantity: number; price: number }>
  shippingAddress: {
    street: string
    city: string
    state: string
    pincode: string
  }
}

export default function SellerDetails({ seller, onBack }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [seller.id])

  async function loadData() {
    try {
      const [productsData, ordersData] = await Promise.all([
        getSellerProducts(seller.sellerId),
        getSellerOrders(seller.sellerId)
      ])
      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0)
  const activeProducts = products.filter(p => p.status === 'active').length

  const categoryEmoji = seller.category === 'Electronics' ? '💻' :
                         seller.category === 'Fashion' ? '👕' :
                         seller.category === 'Home & Kitchen' ? '🏠' :
                         seller.category === 'Sports & Fitness' ? '⚽' : '🏪'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl text-purple-300 font-semibold transition-all"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MarketOS Admin</h1>
                <p className="text-xs text-purple-300 font-medium">Seller Details</p>
              </div>
            </div>
            <div className="w-40"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{categoryEmoji}</span>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">{seller.businessName}</h2>
                <p className="text-sm text-purple-400 font-mono mb-2">🆔 Seller ID: {seller.sellerId}</p>
                <p className="text-lg text-gray-400">{seller.email}</p>
                {(seller as any).phone && (
                  <p className="text-sm text-gray-400 mt-1">📞 {(seller as any).phone}</p>
                )}
                {(seller as any).storeAddress && (
                  <p className="text-sm text-gray-400 mt-1">
                    📍 {(seller as any).storeAddress}, {(seller as any).city}, {(seller as any).state} - {(seller as any).pincode}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    seller.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500' : 
                    seller.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' : 
                    'bg-red-500/20 text-red-400 border border-red-500'
                  }`}>
                    {seller.status.toUpperCase()}
                  </span>
                  <span className="text-purple-400 font-semibold">{seller.category}</span>
                  <span className="text-gray-400">Joined: {new Date(seller.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 font-semibold mb-1">TOTAL REVENUE</div>
              <div className="text-5xl font-bold text-green-400">₹{seller.revenue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-sm text-gray-400 font-semibold mb-2">Orders</div>
              <div className="text-3xl font-bold text-white">{seller.totalOrders || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 font-semibold mb-2">Products</div>
              <div className="text-3xl font-bold text-blue-400">{activeProducts || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 font-semibold mb-2">Total Stock</div>
              <div className="text-3xl font-bold text-yellow-400">{totalStock || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 font-semibold mb-2">Total Sold</div>
              <div className="text-3xl font-bold text-pink-400">{totalSold || 0}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📦 Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🛒 Orders ({orders.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center text-purple-300 text-xl py-12">Loading...</div>
        ) : activeTab === 'products' ? (
          products.length === 0 ? (
            <div className="text-center text-gray-400 text-xl py-12 bg-gray-800/50 rounded-xl border border-purple-500/30">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )
        ) : (
          orders.length === 0 ? (
            <div className="text-center text-gray-400 text-xl py-12 bg-gray-800/50 rounded-xl border border-purple-500/30">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.orderId} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-mono text-purple-400">#{order.orderId}</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-white font-semibold text-lg">👤 {order.customerName}</div>
                      <div className="text-sm text-gray-400">📧 {order.customerEmail}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        📍 {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Total Amount</div>
                      <div className="text-3xl font-bold text-green-400">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <div className="text-sm font-semibold text-purple-300 mb-3">📦 Order Items ({order.products?.length || 0})</div>
                    <div className="space-y-2">
                      {order.products?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                          <div className="flex-1">
                            <div className="text-white font-medium">{item.name}</div>
                            <div className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500">
                      🕒 Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      Order ID: {order.orderId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
