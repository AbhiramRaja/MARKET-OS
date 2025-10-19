import { useEffect, useState } from 'react'
import { listOrders, updateOrderStatus } from './api/orders'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      // Demo orders data that matches realistic dashboard revenue of ₹4.85L
      const demoOrders = [
        {
          orderId: 'ORD-2024-001',
          createdAt: '2024-10-18T10:30:00Z',
          totalAmount: 4498,
          status: 'DELIVERED',
          customerName: 'Rahul Sharma',
          products: ['Premium Wireless Headphones']
        },
        {
          orderId: 'ORD-2024-002', 
          createdAt: '2024-10-18T14:15:00Z',
          totalAmount: 2999,
          status: 'SHIPPED',
          customerName: 'Priya Patel',
          products: ['Portable Bluetooth Speaker', 'Wireless Charging Pad']
        },
        {
          orderId: 'ORD-2024-003',
          createdAt: '2024-10-18T16:45:00Z',
          totalAmount: 3000,
          status: 'PACKED',
          customerName: 'Amit Kumar',
          products: ['Smart LED Light Bulbs', 'Wireless Charging Pad']
        },
        {
          orderId: 'ORD-2024-004',
          createdAt: '2024-10-17T09:20:00Z',
          totalAmount: 4998,
          status: 'DELIVERED',
          customerName: 'Sneha Gupta',
          products: ['Premium Wireless Headphones', 'Smart Fitness Watch']
        },
        {
          orderId: 'ORD-2024-005',
          createdAt: '2024-10-17T11:30:00Z',
          totalAmount: 3499,
          status: 'PENDING',
          customerName: 'Rajesh Singh',
          products: ['Smart Fitness Watch', 'Smart LED Light Bulbs']
        },
        {
          orderId: 'ORD-2024-006',
          createdAt: '2024-10-16T15:20:00Z',
          totalAmount: 1899,
          status: 'DELIVERED',
          customerName: 'Kavya Mehta',
          products: ['Wireless Charging Pad', 'Phone Case']
        },
        {
          orderId: 'ORD-2024-007',
          createdAt: '2024-10-16T11:45:00Z',
          totalAmount: 2299,
          status: 'DELIVERED',
          customerName: 'Arjun Das',
          products: ['Gaming Mouse']
        },
        {
          orderId: 'ORD-2024-008',
          createdAt: '2024-10-15T09:30:00Z',
          totalAmount: 1799,
          status: 'DELIVERED',
          customerName: 'Nisha Agarwal',
          products: ['Bluetooth Speaker']
        }
      ]
      
      setOrders(demoOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(orderId: string, status: 'PACKED' | 'SHIPPED' | 'DELIVERED') {
    try {
      await updateOrderStatus(orderId, status)
      loadOrders()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'pending') return o.status === 'PENDING' || o.status === 'PLACED'
    if (filter === 'delivered') return o.status === 'DELIVERED'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 inline-flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filter === 'all' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filter === 'pending' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Pending ({orders.filter(o => o.status === 'PENDING' || o.status === 'PLACED').length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filter === 'delivered' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Delivered ({orders.filter(o => o.status === 'DELIVERED').length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Orders will appear here once customers place them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.orderId} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order #{order.orderId.slice(0, 8)}</h3>
                  <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</p>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold mt-2 ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PACKED' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status !== 'DELIVERED' && (
                <div className="flex gap-3 border-t pt-4">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusUpdate(order.orderId, 'PACKED')}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Mark as Packed
                    </button>
                  )}
                  {order.status === 'PACKED' && (
                    <button
                      onClick={() => handleStatusUpdate(order.orderId, 'SHIPPED')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleStatusUpdate(order.orderId, 'DELIVERED')}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
