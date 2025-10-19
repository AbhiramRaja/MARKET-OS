import { Seller } from '../lib/api-client'

interface Props {
  seller: Seller
  onClick: () => void
}

export default function SellerCard({ seller, onClick }: Props) {
  const statusColor = seller.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500' : 
                       seller.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 
                       'bg-red-500/20 text-red-400 border-red-500'
  
  const categoryEmoji = seller.category === 'Electronics' ? '💻' :
                         seller.category === 'Fashion' ? '👕' :
                         seller.category === 'Home & Kitchen' ? '🏠' :
                         seller.category === 'Sports & Fitness' ? '⚽' : '🏪'
  
  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{categoryEmoji}</span>
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{seller.businessName}</h3>
            <p className="text-xs text-purple-400 font-mono mb-1">ID: {seller.sellerId}</p>
            <p className="text-sm text-gray-400">{seller.email}</p>
            {(seller as any).city && (
              <p className="text-xs text-gray-500 mt-1">📍 {(seller as any).city}, {(seller as any).state}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                {seller.status.toUpperCase()}
              </span>
              <span className="text-xs text-purple-400 font-semibold">{seller.category}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 font-semibold mb-1">REVENUE</div>
          <div className="text-2xl font-bold text-green-400">₹{seller.revenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700 text-center">
        <div className="text-xs text-gray-400 font-semibold mb-1">TOTAL ORDERS</div>
        <div className="text-2xl font-bold text-purple-400">{seller.totalOrders || 0}</div>
      </div>

      <div className="mt-4 text-center text-purple-400 text-sm font-semibold group-hover:text-purple-300 transition-colors">
        View Details →
      </div>
    </div>
  )
}
