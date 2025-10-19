import { useState, useEffect } from 'react'
import { Seller, getAllSellers, getDashboardStats, SellerStats } from './lib/api-client'
import SellerCard from './components/SellerCard'
import SellerDetails from './pages/SellerDetails'

export default function App() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')

  function handleSignOut() {
    // Clear any stored data
    localStorage.clear()
    sessionStorage.clear()
    // Redirect to login page
    window.location.href = '/login'
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      const [sellersData, statsData] = await Promise.all([
        getAllSellers(),
        getDashboardStats()
      ])
      const sorted = sellersData.sort((a, b) => b.revenue - a.revenue)
      setSellers(sorted)
      setStats(statsData)
      setError(null)
    } catch (error: any) {
      console.error('Failed to load data:', error)
      setError(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Sports & Fitness', 'Books', 'Beauty & Personal Care', 'Toys & Games']
  
  const filteredSellers = sellers.filter(s => {
    const matchesSearch = (s.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (s.sellerId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (selectedSeller) {
    return <SellerDetails seller={selectedSeller} onBack={() => setSelectedSeller(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MarketOS Admin</h1>
                <p className="text-xs text-purple-300 font-medium">Platform Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
                <p className="text-sm font-bold text-white">Admin Portal</p>
                <p className="text-xs text-purple-300">Live Updates</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl font-semibold bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-xl p-4 text-red-200">
            <strong>Error:</strong> {error}
            <button onClick={loadData} className="ml-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600">
              Retry
            </button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
              <div className="text-sm text-green-300 font-semibold mb-2">TOTAL REVENUE</div>
              <div className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
              <div className="text-sm text-blue-300 font-semibold mb-2">TOTAL ORDERS</div>
              <div className="text-3xl font-bold text-white">{stats.totalOrders.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/30 rounded-xl p-6">
              <div className="text-sm text-purple-300 font-semibold mb-2">ACTIVE SELLERS</div>
              <div className="text-3xl font-bold text-white">{stats.activeSellers}</div>
            </div>
            <div 
              onClick={() => window.open('/pending-verifications', '_blank')}
              className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-500/30 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div className="text-sm text-yellow-300 font-semibold mb-2">PENDING VERIFICATIONS</div>
              <div className="text-3xl font-bold text-white">{stats.pendingSellers}</div>
              <div className="text-xs text-yellow-200 mt-2">👆 Click to review</div>
            </div>
            <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-500/30 rounded-xl p-6">
              <div className="text-sm text-pink-300 font-semibold mb-2">TOTAL PRODUCTS</div>
              <div className="text-3xl font-bold text-white">{stats.totalProducts}</div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search sellers by name, email, or seller ID (e.g., seller_001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat === 'Electronics' && '💻'} 
              {cat === 'Fashion' && '👕'}
              {cat === 'Home & Kitchen' && '🏠'}
              {cat === 'Sports & Fitness' && '⚽'}
              {cat === 'All' && '📊'} {cat}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-4">📊 All Sellers</h2>
          <p className="text-gray-400 mb-6">
            Click on any seller to view their products and orders
            {filteredSellers.length > 0 && ` • ${filteredSellers.length} seller${filteredSellers.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-purple-300 text-2xl py-20">
            <div className="animate-pulse">Loading sellers...</div>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-20 bg-gray-800/50 rounded-2xl border border-purple-500/30">
            {searchTerm || categoryFilter !== 'All' ? 'No sellers found matching your filters' : 'No sellers found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <SellerCard 
                key={seller.id} 
                seller={seller} 
                onClick={() => setSelectedSeller(seller)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
