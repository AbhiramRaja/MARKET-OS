import { useState, useEffect } from 'react'
import { getSavedSeller } from '../lib/seller-bus'
// AWS API imports - will be used when backend is fully integrated
// import { getSellerAnalytics, getSalesTrends, getTopProducts } from '../lib/aws-api'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  growthRate: number
}

interface TrendData {
  date: string
  revenue: number
  orders: number
}

interface TopProduct {
  productId: string
  name: string
  sales: number
  revenue: number
}

export default function Analytics() {
  const seller = getSavedSeller() // For future use with backend API
  console.log('Seller:', seller.sellerId) // Using seller to avoid unused warning
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function loadAnalytics() {
    setLoading(true)
    try {
      // Demo analytics data for realistic presentation
      const mockAnalytics: AnalyticsData = {
        totalRevenue: 485000,
        totalOrders: 247,
        averageOrderValue: 1963,
        conversionRate: 8.7,
        growthRate: 15.3
      }

      // Demo trends data for last 30 days - more realistic for growing seller
      const mockTrends: TrendData[] = [
        { date: '2024-10-01', revenue: 12500, orders: 6 },
        { date: '2024-10-02', revenue: 15800, orders: 8 },
        { date: '2024-10-03', revenue: 9200, orders: 5 },
        { date: '2024-10-04', revenue: 18600, orders: 9 },
        { date: '2024-10-05', revenue: 21400, orders: 11 },
        { date: '2024-10-06', revenue: 16900, orders: 9 },
        { date: '2024-10-07', revenue: 13200, orders: 7 },
        { date: '2024-10-08', revenue: 24800, orders: 12 },
        { date: '2024-10-09', revenue: 19300, orders: 10 },
        { date: '2024-10-10', revenue: 22700, orders: 11 },
        { date: '2024-10-11', revenue: 17500, orders: 9 },
        { date: '2024-10-12', revenue: 26400, orders: 13 },
        { date: '2024-10-13', revenue: 20100, orders: 10 },
        { date: '2024-10-14', revenue: 18900, orders: 9 },
        { date: '2024-10-15', revenue: 28200, orders: 14 }
      ]
      
      // Demo top products - realistic sales for growing seller
      const mockTopProducts: TopProduct[] = [
        { productId: 'ELEC-1234', name: 'Premium Wireless Headphones', sales: 42, revenue: 125958 },
        { productId: 'GADG-5678', name: 'Smart Fitness Watch', sales: 38, revenue: 75962 },
        { productId: 'TECH-9012', name: 'Portable Bluetooth Speaker', sales: 34, revenue: 50966 },
        { productId: 'HOME-3456', name: 'Smart LED Light Bulbs (4-pack)', sales: 29, revenue: 43500 },
        { productId: 'ACCS-7890', name: 'Wireless Charging Pad', sales: 26, revenue: 39000 }
      ]

      setAnalytics(mockAnalytics)
      setTrends(mockTrends)
      setTopProducts(mockTopProducts)

      // Uncomment when AWS endpoints are ready:
      // const [analyticsData, trendsData, topProds] = await Promise.all([
      //   getSellerAnalytics(seller.sellerId, period),
      //   getSalesTrends(seller.sellerId, period),
      //   getTopProducts(seller.sellerId, 5)
      // ])
      // setAnalytics(analyticsData)
      // setTrends(trendsData)
      // setTopProducts(topProds)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-purple-300">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">📊 Analytics Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-xl border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
            <div className="text-sm text-green-300 font-semibold mb-2">TOTAL REVENUE</div>
            <div className="text-3xl font-bold text-white">₹{analytics.totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-green-200 mt-2">+{analytics.growthRate}% from last period</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
            <div className="text-sm text-blue-300 font-semibold mb-2">TOTAL ORDERS</div>
            <div className="text-3xl font-bold text-white">{analytics.totalOrders}</div>
            <div className="text-xs text-blue-200 mt-2">{period === '7d' ? 'This week' : 'This month'}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/30 rounded-xl p-6">
            <div className="text-sm text-purple-300 font-semibold mb-2">AVG ORDER VALUE</div>
            <div className="text-3xl font-bold text-white">₹{analytics.averageOrderValue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-purple-200 mt-2">Per transaction</div>
          </div>

          <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-500/30 rounded-xl p-6">
            <div className="text-sm text-pink-300 font-semibold mb-2">CONVERSION RATE</div>
            <div className="text-3xl font-bold text-white">{analytics.conversionRate}%</div>
            <div className="text-xs text-pink-200 mt-2">Visitors to buyers</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-500/30 rounded-xl p-6">
            <div className="text-sm text-orange-300 font-semibold mb-2">GROWTH RATE</div>
            <div className="text-3xl font-bold text-white">+{analytics.growthRate}%</div>
            <div className="text-xs text-orange-200 mt-2">Month over month</div>
          </div>
        </div>
      )}

      {/* Sales Trend Chart */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📈 Sales Trend</h2>
        <div className="h-64 flex items-end gap-2">
          {trends.slice(-15).map((trend, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${(trend.revenue / 150000) * 100}%` }}
                title={`₹${trend.revenue.toLocaleString('en-IN')}`}
              />
              <div className="text-xs text-gray-400 rotate-45 origin-left whitespace-nowrap">
                {trend.date.split('/').slice(0, 2).join('/')}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>Daily Revenue Trend</span>
          <span>Last {trends.length} days</span>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🏆 Top Selling Products</h2>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.productId} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                index === 0 ? 'bg-yellow-500 text-gray-900' :
                index === 1 ? 'bg-gray-400 text-gray-900' :
                index === 2 ? 'bg-orange-600 text-white' :
                'bg-gray-700 text-gray-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{product.name}</div>
                <div className="text-sm text-gray-400">{product.sales} units sold</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-400">₹{product.revenue.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-400">Total revenue</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📊 Revenue by Category</h2>
          <div className="space-y-3">
            {[
              { name: 'Smartphones', percentage: 42, amount: 1197000 },
              { name: 'Laptops', percentage: 31, amount: 883500 },
              { name: 'Accessories', percentage: 18, amount: 513000 },
              { name: 'Tablets', percentage: 9, amount: 256500 }
            ].map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300">{cat.name}</span>
                  <span className="text-white font-semibold">₹{cat.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">{cat.percentage}% of total</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Return Rate</span>
              <span className="text-green-400 font-semibold">2.1%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Customer Satisfaction</span>
              <span className="text-yellow-400 font-semibold">4.8/5.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Repeat Customer Rate</span>
              <span className="text-purple-400 font-semibold">38%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Avg Delivery Time</span>
              <span className="text-blue-400 font-semibold">2.3 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
