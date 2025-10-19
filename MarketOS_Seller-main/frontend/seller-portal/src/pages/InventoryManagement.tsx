import { useState, useEffect } from 'react'
import { getSavedSeller } from '../lib/seller-bus'
// AWS API imports - will be used when backend is fully integrated
// import { getSellerProducts, getLowStockProducts, updateStock, bulkUpdateProducts } from '../lib/aws-api'

interface Product {
  productId: string
  name: string
  category: string
  price: number
  stock: number
  imageUrl: string
}

export default function Inventory() {
  const seller = getSavedSeller() // For future use with backend API
  console.log('Seller:', seller.sellerId) // Using seller to avoid unused warning
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadInventory()
  }, [])

  async function loadInventory() {
    setLoading(true)
    try {
      // Demo inventory data that matches our realistic dashboard metrics and order history
      const demoProducts: Product[] = [
        {
          productId: 'ELEC-1234',
          name: 'Premium Wireless Headphones',
          category: 'Electronics',
          price: 2999,
          stock: 23, // Moderate stock after sales
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
        },
        {
          productId: 'GADG-5678',
          name: 'Smart Fitness Watch',
          category: 'Electronics',
          price: 1999,
          stock: 42, // Good stock
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
        },
        {
          productId: 'TECH-9012',
          name: 'Portable Bluetooth Speaker',
          category: 'Electronics',
          price: 1499,
          stock: 156, // High stock
          imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
        },
        {
          productId: 'HOME-3456',
          name: 'Smart LED Light Bulbs (4-pack)',
          category: 'Home & Garden',
          price: 1500,
          stock: 8, // Low stock
          imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=400&fit=crop'
        },
        {
          productId: 'ACCS-7890',
          name: 'Wireless Charging Pad',
          category: 'Electronics',
          price: 1500,
          stock: 0, // Out of stock
          imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
        },
        {
          productId: 'GAME-1111',
          name: 'Wireless Gaming Mouse',
          category: 'Gaming',
          price: 2299,
          stock: 67,
          imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'
        },
        {
          productId: 'PHON-2222',
          name: 'Phone Case Premium',
          category: 'Accessories',
          price: 899,
          stock: 5, // Low stock
          imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop'
        },
        {
          productId: 'KEYB-3333',
          name: 'Mechanical Gaming Keyboard',
          category: 'Gaming',
          price: 3499,
          stock: 34,
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop'
        },
        {
          productId: 'CAM-4444',
          name: 'HD Webcam',
          category: 'Electronics',
          price: 1799,
          stock: 89,
          imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'
        },
        {
          productId: 'TABS-5555',
          name: 'Tablet Stand Adjustable',
          category: 'Accessories',
          price: 1299,
          stock: 156,
          imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
        },
        {
          productId: 'CABL-6666',
          name: 'USB-C Cable (3-pack)',
          category: 'Accessories',
          price: 799,
          stock: 234,
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
        },
        {
          productId: 'LAMP-7777',
          name: 'LED Desk Lamp',
          category: 'Home & Garden',
          price: 2199,
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'
        }
      ]
      
      setProducts(demoProducts)
      setLowStockProducts(demoProducts.filter((p: Product) => p.stock > 0 && p.stock <= 10))
    } catch (error) {
      console.error('Failed to load inventory:', error)
      setProducts([])
      setLowStockProducts([])
    }
    setLoading(false)
  }

  const filteredProducts = products
    .filter(p => {
      if (filter === 'low-stock') return p.stock > 0 && p.stock < 10
      if (filter === 'out-of-stock') return p.stock === 0
      return true
    })
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  function handleStockEdit(productId: string, newStock: number) {
    setEditingStock({ ...editingStock, [productId]: newStock })
  }

  async function handleStockUpdate(productId: string) {
    const newStock = editingStock[productId]
    if (newStock === undefined) return

    try {
      // await updateStock(productId, newStock)
      setProducts(products.map(p => 
        p.productId === productId ? { ...p, stock: newStock } : p
      ))
      const { [productId]: _, ...rest } = editingStock
      setEditingStock(rest)
      alert('✅ Stock updated successfully!')
    } catch (error) {
      alert('❌ Failed to update stock')
    }
  }

  function exportToCSV() {
    const csv = [
      ['Product ID', 'Name', 'Category', 'Price', 'Stock'].join(','),
      ...products.map(p => [p.productId, p.name, p.category, p.price, p.stock].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-purple-300">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">📦 Inventory Management</h1>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="font-bold text-yellow-300 text-lg">Low Stock Alert!</div>
              <div className="text-yellow-200">{lowStockProducts.length} products have low stock (&lt; 10 units)</div>
              <button
                onClick={() => setFilter('low-stock')}
                className="mt-2 text-sm text-yellow-300 underline hover:text-yellow-200"
              >
                View low stock items →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-300 font-semibold mb-2">TOTAL PRODUCTS</div>
          <div className="text-3xl font-bold text-white">{products.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-300 font-semibold mb-2">IN STOCK</div>
          <div className="text-3xl font-bold text-white">{products.filter(p => p.stock > 10).length}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-sm text-yellow-300 font-semibold mb-2">LOW STOCK</div>
          <div className="text-3xl font-bold text-white">{lowStockProducts.length}</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-500/30 rounded-xl p-6">
          <div className="text-sm text-red-300 font-semibold mb-2">OUT OF STOCK</div>
          <div className="text-3xl font-bold text-white">{products.filter(p => p.stock === 0).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
              filter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
              filter === 'low-stock' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilter('out-of-stock')}
            className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
              filter === 'out-of-stock' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{product.name}</div>
                    <div className="text-sm text-gray-400">{product.productId}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{product.category}</td>
                  <td className="px-6 py-4 text-white font-semibold">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    {editingStock[product.productId] !== undefined ? (
                      <input
                        type="number"
                        value={editingStock[product.productId]}
                        onChange={(e) => handleStockEdit(product.productId, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-gray-700 text-white rounded border border-purple-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-white font-semibold">{product.stock} units</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.stock === 0 ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold">Out of Stock</span>
                    ) : product.stock < 10 ? (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-semibold">Low Stock</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingStock[product.productId] !== undefined ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStockUpdate(product.productId)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-semibold"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => {
                            const { [product.productId]: _, ...rest } = editingStock
                            setEditingStock(rest)
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStockEdit(product.productId, product.stock)}
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-semibold"
                      >
                        Edit Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-xl text-gray-400">No products found</div>
        </div>
      )}
    </div>
  )
}
