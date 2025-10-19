import { useState } from 'react'
import { getSavedSeller } from '../lib/seller-bus'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddProductModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  })
  const seller = getSavedSeller()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      await fetch('http://localhost:3001/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sellerId: seller.sellerId,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-6">Add New Product</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500 resize-none"
              rows={3}
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
              placeholder="e.g., Electronics, Fashion"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Stock</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
