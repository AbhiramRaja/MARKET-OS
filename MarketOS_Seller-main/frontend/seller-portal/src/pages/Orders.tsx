import { useState, useEffect } from 'react'
import { getSavedSeller } from '../lib/seller-bus'

interface Order {
  orderId: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{ productName: string; quantity: number; price: number }>
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const seller = getSavedSeller()

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadOrders() {
    try {
      const response = await fetch(`http://localhost:3001/orders/seller/${seller.sellerId}`)
      const data = await response.json()
      setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      loadOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">🛒 Orders ({orders.length})</h2>

      {loading ? (
        <div className="text-center text-purple-300 text-xl py-20">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400 py-20 bg-gray-800/50 rounded-xl border border-purple-500/30">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-400">Order ID: {order.orderId}</div>
                  <div className="text-white font-semibold text-lg">{order.customerEmail}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">₹{order.totalAmount.toFixed(2)}</div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500' :
                      order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400 border-blue-500' :
                      order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' :
                      'bg-gray-500/20 text-gray-400 border-gray-500'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="text-sm font-semibold text-gray-400 mb-2">Order Items:</div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.productName} x{item.quantity}</span>
                      <span className="text-white font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
