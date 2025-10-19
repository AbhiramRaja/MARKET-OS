import { Product } from '../lib/api-client'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const stockStatus = product.stock > 50 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'
  const stockColor = product.stock > 50 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-500/30 transition-all">
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            '📦'
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-1">{product.name}</h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-semibold">
              {product.category}
            </span>
            <span className={`px-2 py-1 ${stockColor} bg-opacity-20 text-xs rounded-full font-semibold`}>
              {stockStatus}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-gray-400">Price</div>
              <div className="text-lg font-bold text-green-400">₹{product.price}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Stock</div>
              <div className="text-lg font-bold text-white">{product.stock}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Sold</div>
              <div className="text-lg font-bold text-purple-400">{product.sold}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
