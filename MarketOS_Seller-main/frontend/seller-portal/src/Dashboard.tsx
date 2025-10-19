import { useEffect, useState } from 'react'
import { listOrders, listProducts } from './api/orders'
import { getSavedSeller } from './lib/seller-bus'

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'orders' | 'products') => void
  signOut: () => void
}

export default function Dashboard({ onNavigate, signOut }: DashboardProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const { id: sellerId } = getSavedSeller()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [allOrders, allProducts] = await Promise.all([
        listOrders(),
        listProducts()
      ])

      // Filter by current seller
      const orders = allOrders.filter((o: any) => o.sellerId === sellerId)
      const products = allProducts.filter((p: any) => p.sellerId === sellerId)

      // Pending orders (not delivered/cancelled)
      const pending = orders.filter((o: any) => 
        o.status === 'PENDING' || o.status === 'PLACED' || o.status === 'ACCEPTED' || 
        o.status === 'PACKED' || o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY'
      )
      
      // Revenue ONLY from delivered orders
      const deliveredOrders = orders.filter((o: any) => o.status === 'DELIVERED')
      const revenue = deliveredOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
      
      // Out of stock products (stock = 0)
      const outOfStock = products.filter((p: any) => (p.stock || 0) === 0)
      
      // Low stock products (1-9 items)
      const lowStock = products.filter((p: any) => {
        const stock = p.stock || 0
        return stock > 0 && stock < 10
      })

      setStats({
        totalOrders: orders.length,
        pendingOrders: pending.length,
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        outOfStockProducts: outOfStock.length,
        totalRevenue: revenue,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  const totalStockIssues = stats.outOfStockProducts + stats.lowStockProducts

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-bold text-white mb-3">Welcome Back! 👋</h1>
          <p className="text-xl text-purple-300">Here's what's happening with your store today</p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-red-300 hover:text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Clickable Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <button
          onClick={() => onNavigate('orders')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-blue-100 font-semibold uppercase">Total Revenue</p>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-blue-100">From delivered orders</p>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-orange-100 font-semibold uppercase">Pending Orders</p>
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{stats.pendingOrders}</p>
          <p className="text-sm text-orange-100">Need attention</p>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-green-100 font-semibold uppercase">My Products</p>
            <span className="text-3xl">��</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{stats.totalProducts}</p>
          <p className="text-sm text-green-100">In catalog</p>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-red-100 font-semibold uppercase">Stock Issues</p>
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{totalStockIssues}</p>
          <p className="text-sm text-red-100">
            {stats.outOfStockProducts} out • {stats.lowStockProducts} low
          </p>
        </button>
      </div>

      <h2 className="text-3xl font-bold text-white mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-8">
        <button
          onClick={() => onNavigate('orders')}
          className="bg-gradient-to-br from-purple-800/80 to-blue-800/80 backdrop-blur-lg border-2 border-purple-500/50 rounded-3xl shadow-2xl hover:shadow-purple-500/50 transition-all p-8 text-left group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
              📦
            </div>
            <span className="text-purple-300 text-3xl opacity-0 group-hover:opacity-100 transition">→</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">Manage Orders</h3>
          <p className="text-purple-200 text-lg mb-4">View and process customer orders. Update status and track deliveries.</p>
          <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-4 inline-block border border-purple-400">
            <p className="text-sm font-bold text-white">{stats.pendingOrders} orders need attention</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="bg-gradient-to-br from-purple-800/80 to-indigo-800/80 backdrop-blur-lg border-2 border-indigo-500/50 rounded-3xl shadow-2xl hover:shadow-indigo-500/50 transition-all p-8 text-left group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
              🛍️
            </div>
            <span className="text-indigo-300 text-3xl opacity-0 group-hover:opacity-100 transition">→</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">Manage Products</h3>
          <p className="text-indigo-200 text-lg mb-4">Add new products, update prices and stock, or remove items.</p>
          <div className="bg-indigo-500/30 backdrop-blur-sm rounded-xl p-4 inline-block border border-indigo-400">
            <p className="text-sm font-bold text-white">{stats.totalProducts} products in catalog</p>
          </div>
        </button>
      </div>

      {totalStockIssues > 0 && (
        <div className="mt-8 bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-lg border-2 border-red-500 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Stock Alert!</h3>
              <p className="text-red-200 mb-2 text-lg">
                {stats.outOfStockProducts > 0 && (
                  <span className="font-bold">
                    {stats.outOfStockProducts} {stats.outOfStockProducts === 1 ? 'product is' : 'products are'} out of stock
                  </span>
                )}
                {stats.outOfStockProducts > 0 && stats.lowStockProducts > 0 && ' • '}
                {stats.lowStockProducts > 0 && (
                  <span>
                    {stats.lowStockProducts} running low ({"<"}10 items)
                  </span>
                )}
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg"
              >
                Restock Items →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
