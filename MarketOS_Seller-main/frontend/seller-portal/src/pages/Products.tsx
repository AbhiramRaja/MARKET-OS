import { useState, useEffect } from 'react'
import { getSavedSeller } from '../lib/seller-bus'

interface Product {
  productId: string
  name: string
  category: string
  price: number
  stock: number
  description: string
  imageUrl: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const saved = getSavedSeller()

  useEffect(() => {
    // Demo products for realistic presentation - 12 products total
    const demoProducts: Product[] = [
      {
        productId: 'ELEC-1234',
        name: 'Premium Wireless Headphones',
        category: 'Electronics',
        price: 2999,
        stock: 23,
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      },
      {
        productId: 'GADG-5678',
        name: 'Smart Fitness Watch',
        category: 'Electronics',
        price: 1999,
        stock: 42,
        description: 'Advanced fitness tracker with heart rate monitor and GPS tracking',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
      },
      {
        productId: 'TECH-9012',
        name: 'Portable Bluetooth Speaker',
        category: 'Electronics',
        price: 1499,
        stock: 156,
        description: 'Waterproof Bluetooth speaker with premium sound quality and 20-hour battery',
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
      },
      {
        productId: 'HOME-3456',
        name: 'Smart LED Light Bulbs (4-pack)',
        category: 'Home & Garden',
        price: 1500,
        stock: 8,
        description: 'WiFi-enabled smart LED bulbs with 16 million colors and voice control support',
        imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=400&fit=crop'
      },
      {
        productId: 'ACCS-7890',
        name: 'Wireless Charging Pad',
        category: 'Electronics',
        price: 1500,
        stock: 0,
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
        imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
      },
      {
        productId: 'GAME-1111',
        name: 'Wireless Gaming Mouse',
        category: 'Gaming',
        price: 2299,
        stock: 67,
        description: 'High-precision gaming mouse with RGB lighting and programmable buttons',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'
      },
      {
        productId: 'PHON-2222',
        name: 'Phone Case Premium',
        category: 'Accessories',
        price: 899,
        stock: 5,
        description: 'Premium protective case with shock absorption and wireless charging support',
        imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop'
      },
      {
        productId: 'KEYB-3333',
        name: 'Mechanical Gaming Keyboard',
        category: 'Gaming',
        price: 3499,
        stock: 34,
        description: 'RGB mechanical keyboard with custom switches and programmable macros',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop'
      },
      {
        productId: 'CAM-4444',
        name: 'HD Webcam',
        category: 'Electronics',
        price: 1799,
        stock: 89,
        description: '1080p HD webcam with auto-focus and built-in microphone for streaming',
        imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
      },
      {
        productId: 'TABS-5555',
        name: 'Tablet Stand Adjustable',
        category: 'Accessories',
        price: 1299,
        stock: 156,
        description: 'Adjustable aluminum tablet stand for all tablet sizes and angles',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
      },
      {
        productId: 'CABL-6666',
        name: 'USB-C Cable (3-pack)',
        category: 'Accessories',
        price: 799,
        stock: 234,
        description: 'Durable braided USB-C cables with fast charging and data transfer',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
      },
      {
        productId: 'LAMP-7777',
        name: 'LED Desk Lamp',
        category: 'Home & Garden',
        price: 2199,
        stock: 45,
        description: 'Smart LED desk lamp with adjustable brightness and color temperature',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'
      }
    ]
    
    setProducts(demoProducts)
    setLoading(false)
  }, [saved.sellerId])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-gray-400 mt-4">Loading products...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">📦 Products</h2>
          <p className="text-gray-400">You have {products.length} products</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all">
          ➕ Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.productId}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 transition-all"
          >
            <div className="aspect-square bg-gray-700 rounded-lg mb-4 overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-green-400">₹{product.price}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                product.stock > 20 ? 'bg-green-500/20 text-green-300' :
                product.stock > 0 ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {product.stock} in stock
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-300 font-semibold transition-all">
                ✏️ Edit
              </button>
              <button className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-semibold transition-all">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
