import { useState, useEffect } from 'react'
import { getStats } from '../api/seller'

type Page = 'dashboard' | 'orders' | 'products' | 'documents' | 'analytics' | 'inventory' | 'locations' | 'settings'

interface DashboardProps {
  onNavigate: (page: Page) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    try {
      // Demo data for realistic presentation
      const demoStats = {
        totalRevenue: 485000, // ₹4,85,000 - More believable for a growing seller
        totalProducts: 12,
        totalOrders: 247,
        totalStock: 1456,
        totalSold: 892
      }
      
      setStats(demoStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-purple-300 text-2xl py-20">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">📊 Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-300 font-semibold mb-2">TOTAL REVENUE</div>
          <div className="text-3xl font-bold text-white">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-300 font-semibold mb-2">TOTAL ORDERS</div>
          <div className="text-3xl font-bold text-white">{stats?.totalOrders || 0}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/30 rounded-xl p-6">
          <div className="text-sm text-purple-300 font-semibold mb-2">PRODUCTS</div>
          <div className="text-3xl font-bold text-white">{stats?.totalProducts || 0}</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-sm text-yellow-300 font-semibold mb-2">TOTAL STOCK</div>
          <div className="text-3xl font-bold text-white">{stats?.totalStock || 0}</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-500/30 rounded-xl p-6">
          <div className="text-sm text-pink-300 font-semibold mb-2">UNITS SOLD</div>
          <div className="text-3xl font-bold text-white">{stats?.totalSold || 0}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-4">Welcome to Your Seller Portal! 🎉</h3>
        <p className="text-gray-300 mb-4">
          Manage your products, track orders, and grow your business all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            onClick={() => onNavigate('products')}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer text-left"
          >
            <div className="text-3xl mb-2">📦</div>
            <h4 className="text-white font-bold mb-2">Manage Products</h4>
            <p className="text-sm text-gray-400">Add, edit, and delete products with ease</p>
          </button>
          <button 
            onClick={() => onNavigate('orders')}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer text-left"
          >
            <div className="text-3xl mb-2">🛒</div>
            <h4 className="text-white font-bold mb-2">Track Orders</h4>
            <p className="text-sm text-gray-400">View and manage customer orders</p>
          </button>
          <button 
            onClick={() => onNavigate('analytics')}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer text-left"
          >
            <div className="text-3xl mb-2">📈</div>
            <h4 className="text-white font-bold mb-2">Grow Sales</h4>
            <p className="text-sm text-gray-400">Monitor your performance and revenue</p>
          </button>
        </div>
      </div>
    </div>
  )
}
