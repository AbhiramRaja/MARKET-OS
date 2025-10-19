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
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const saved = getSavedSeller()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    description: '',
    imageUrl: ''
  })

  // Load products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('sellerProducts')
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
      setLoading(false)
      return
    }
    
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
    localStorage.setItem('sellerProducts', JSON.stringify(demoProducts))
    setLoading(false)
  }, [saved.sellerId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const newProduct: Product = {
        productId: `PROD-${Date.now()}`,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      }

      const updatedProducts = [...products, newProduct]
      setProducts(updatedProducts)
      localStorage.setItem('sellerProducts', JSON.stringify(updatedProducts))

      // Also try to save to backend if available
      try {
        await fetch('http://localhost:3001/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProduct,
            sellerId: saved.sellerId,
            sellerName: saved.businessName
          })
        })
        console.log('✅ Product saved to backend')
      } catch (backendError) {
        console.log('ℹ️ Backend not available, product saved locally only')
      }

      alert('✅ Product added successfully!')
      
      // Reset form
      setFormData({
        name: '',
        category: 'Electronics',
        price: '',
        stock: '',
        description: '',
        imageUrl: ''
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding product:', error)
      alert('❌ Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.productId !== productId)
      setProducts(updatedProducts)
      localStorage.setItem('sellerProducts', JSON.stringify(updatedProducts))
      alert('✅ Product deleted successfully!')
    }
  }

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
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          {showAddForm ? '❌ Cancel' : '➕ Add New Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Wireless Headphones"
                  className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Toys">Toys</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 2999"
                  className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="e.g., 50"
                  className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe your product in detail..."
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Image URL (optional)</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-sm text-gray-400 mt-2">Leave empty for default image</p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? '⏳ Adding Product...' : '✅ Add Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
              <button 
                onClick={() => handleDeleteProduct(product.productId)}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-semibold transition-all"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
