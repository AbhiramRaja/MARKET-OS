import { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct } from './api/orders'
import { getSavedSeller } from './lib/seller-bus'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showRestock, setShowRestock] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [restockProduct, setRestockProduct] = useState<any>(null)
  const [restockAmount, setRestockAmount] = useState('')
  const [searchSKU, setSearchSKU] = useState('')
  const seller = getSavedSeller()
  const sellerId = seller.sellerId || seller.id

  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    description: '',
    sku: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await listProducts()
      const myProducts = data.filter((p: any) => p.sellerId === sellerId)
      setProducts(myProducts)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateSKU(category: string) {
    const prefix = category.slice(0, 4).toUpperCase()
    const random = Math.floor(Math.random() * 9000) + 1000
    return `${prefix}-${random}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!sellerId) {
      alert('Seller ID not found. Please sign in again.')
      return
    }
    
    try {
      const stockQty = parseInt(form.stock)
      const productData = {
        ...form,
        sellerId,
        price: parseFloat(form.price),
        stock: stockQty,
        sku: form.sku || generateSKU(form.category),
        available: stockQty > 0  // Auto set based on stock
      }

      if (editingProduct) {
        await updateProduct(editingProduct.productId, productData)
      } else {
        await createProduct(productData)
      }

      setShowForm(false)
      setEditingProduct(null)
      setForm({ name: '', category: 'Electronics', price: '', stock: '', description: '', sku: '' })
      loadProducts()
    } catch (error: any) {
      alert(error.message || 'Failed to save product')
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(productId)
      loadProducts()
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  function handleEdit(product: any) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      sku: product.sku || ''
    })
    setShowForm(true)
  }

  async function handleRestock() {
    if (!restockProduct || !restockAmount) return
    
    try {
      const newStock = restockProduct.stock + parseInt(restockAmount)
      await updateProduct(restockProduct.productId, {
        ...restockProduct,
        stock: newStock,
        available: newStock > 0  // Auto set based on stock
      })
      
      setShowRestock(false)
      setRestockProduct(null)
      setRestockAmount('')
      loadProducts()
      alert(`✅ Restocked! New stock: ${newStock}`)
    } catch (error) {
      alert('Failed to restock')
    }
  }

  function handleSKUSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchSKU) return

    const found = products.find(p => 
      p.sku?.toLowerCase() === searchSKU.toLowerCase() ||
      p.productId?.toLowerCase().includes(searchSKU.toLowerCase()) ||
      p.name.toLowerCase().includes(searchSKU.toLowerCase())
    )
    
    if (found) {
      setRestockProduct(found)
      setRestockAmount('')
      setShowRestock(true)
      setSearchSKU('')
    } else {
      alert('❌ Product not found! Check Product ID, SKU, or name.')
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchSKU.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchSKU.toLowerCase()) ||
    p.productId?.toLowerCase().includes(searchSKU.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">My Products</h1>
            <p className="text-xl text-purple-300">
              {products.length} items • {products.filter(p => p.stock === 0).length} out of stock
            </p>
          </div>
          <button
            onClick={() => {
              console.log('Add Product button clicked!')
              setShowForm(true)
              setEditingProduct(null)
              setForm({ name: '', category: 'Electronics', price: '', stock: '', description: '', sku: '' })
              console.log('showForm should now be true')
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition"
          >
            ➕ Add Product
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSKUSearch} className="bg-purple-800/50 backdrop-blur-lg border-2 border-purple-600 rounded-xl p-4 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchSKU}
              onChange={(e) => setSearchSKU(e.target.value)}
              className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white text-lg font-mono focus:border-purple-400"
              placeholder="🔍 Search by Product ID, SKU, or name..."
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-bold"
          >
            Quick Restock
          </button>
        </form>
      </div>

      {/* Restock Modal */}
      {showRestock && restockProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-gradient-to-br from-purple-900 to-green-900 border-4 border-green-500 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">📦</div>
              <h2 className="text-4xl font-bold text-white mb-2">Restock Product</h2>
              <p className="text-green-300 text-xl mb-2">{restockProduct.name}</p>
              <div className="bg-purple-500/30 rounded-lg p-3 inline-block">
                <p className="text-cyan-400 text-sm font-mono">ID: {restockProduct.productId}</p>
                <p className="text-cyan-400 text-sm font-mono">SKU: {restockProduct.sku}</p>
              </div>
              <p className="text-white text-2xl font-bold mt-4">
                Current Stock: <span className={restockProduct.stock === 0 ? 'text-red-400' : 'text-white'}>{restockProduct.stock}</span>
              </p>
              {restockProduct.stock === 0 && (
                <p className="text-red-400 text-lg font-bold mt-2">⚠️ OUT OF STOCK</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white font-bold mb-3 text-xl">Add Quantity</label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full bg-purple-900/50 border-4 border-green-500 rounded-xl px-6 py-4 text-white text-3xl font-bold text-center focus:border-green-300"
                  placeholder="0"
                />
              </div>

              {restockAmount && (
                <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6 text-center">
                  <p className="text-green-300 text-lg mb-2">New Stock Level</p>
                  <p className="text-white text-5xl font-bold">
                    {restockProduct.stock + parseInt(restockAmount)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={handleRestock}
                  disabled={!restockAmount || parseInt(restockAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-xl"
                >
                  ✅ Confirm Restock
                </button>
                <button
                  onClick={() => {
                    setShowRestock(false)
                    setRestockProduct(null)
                    setRestockAmount('')
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {console.log('Rendering - showForm is:', showForm)}
      {showForm && (
        <div className="bg-purple-800/50 backdrop-blur-lg border-2 border-purple-600 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-200 font-bold mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white focus:border-purple-400"
                  placeholder="e.g., Wireless Mouse"
                />
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-2">SKU (Auto-generated)</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white focus:border-purple-400 font-mono"
                  placeholder="ELEC-1234 (auto if empty)"
                />
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-2">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white focus:border-purple-400"
                >
                  <option>Electronics</option>
                  <option>Grocery</option>
                  <option>Books</option>
                  <option>Toys</option>
                  <option>Fashion</option>
                  <option>Home</option>
                  <option>Sports</option>
                  <option>Beauty</option>
                </select>
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-2">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white focus:border-purple-400"
                  placeholder="299"
                />
              </div>
              <div>
                <label className="block text-purple-200 font-bold mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white focus:border-purple-400"
                  placeholder="50"
                />
              </div>
            </div>
            <div>
              <label className="block text-purple-200 font-bold mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-purple-900/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white focus:border-purple-400"
                rows={3}
                placeholder="Product description..."
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold"
              >
                {editingProduct ? 'Update' : 'Add'} Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
                className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-purple-800/50 backdrop-blur-lg border-2 border-purple-600 rounded-2xl p-16 text-center">
          <div className="text-8xl mb-4">📦</div>
          <h3 className="text-3xl font-bold text-white mb-2">No products found</h3>
          <p className="text-purple-200 text-lg">Try a different search or add products</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock === 0
            
            return (
              <div
                key={product.productId}
                className={`bg-purple-800/50 backdrop-blur-lg border-2 rounded-2xl p-6 hover:shadow-2xl transition-all ${
                  isOutOfStock ? 'border-red-500 bg-red-900/20' : 'border-purple-600'
                }`}
              >
                <div className="mb-4">
                  {/* Product ID - Prominent at top */}
                  <div className="bg-purple-900/70 rounded-lg p-2 mb-3">
                    <p className="text-cyan-400 text-xs font-mono text-center">
                      ID: {product.productId}
                    </p>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{product.name}</h3>
                      <p className="text-purple-400 text-sm font-mono">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                      isOutOfStock ? 'bg-red-500 animate-pulse' : 
                      product.stock < 10 ? 'bg-orange-500' : 'bg-green-500'
                    } text-white`}>
                      {isOutOfStock ? '❌ OUT OF STOCK' : `${product.stock} in stock`}
                    </span>
                  </div>
                  
                  <p className="text-purple-300 text-sm mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">₹{product.price}</span>
                    <span className="text-purple-300 text-sm">{product.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setRestockProduct(product)
                      setRestockAmount('')
                      setShowRestock(true)
                    }}
                    className={`py-2 rounded-lg font-bold text-sm ${
                      isOutOfStock 
                        ? 'col-span-2 bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isOutOfStock ? '🔄 Restock Now' : '➕ Restock'}
                  </button>
                  
                  {!isOutOfStock && (
                    <>
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.productId)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold text-sm col-span-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  
                  {isOutOfStock && (
                    <>
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.productId)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
