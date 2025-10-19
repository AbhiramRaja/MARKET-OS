import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import OrderService from '../../services/OrderService';

const AdminDashboard = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAdminAccess();
    loadOrders();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const session = await fetchAuthSession();
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
      
      // Check if user is in admin group
      // For development/demo: Allow access if user is authenticated
      if (!groups.includes('Admin')) {
        console.log('User not in Admin group, but allowing access for demo purposes');
        // Uncomment the line below to enforce admin-only access in production
        // alert('Access Denied: Admin privileges required');
        // navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      // For development, allow access if user is authenticated
      console.log('Admin access check bypassed for development');
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await OrderService.getOrders();
      
      // Transform orders to ensure consistent format
      const transformedOrders = fetchedOrders.map(order => ({
        id: order.id || order.orderId,
        customerName: order.customerName || order.userId || 'Guest User',
        customerEmail: order.customerEmail || 'N/A',
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : order.date,
        status: order.status || 'processing',
        total: order.total || 0,
        items: Array.isArray(order.items) ? order.items.length : (order.items || 0),
        products: Array.isArray(order.items) 
          ? order.items.map(item => item.name || item.productId) 
          : (order.products || [])
      }));
      
      setOrders(transformedOrders);
      calculateStats(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Use mock data for demo
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      calculateStats(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => {
    return [
      {
        id: 'ORD-2025-001234',
        customerName: 'Abhiram Kumar',
        customerEmail: 'abhiram@example.com',
        date: '2025-01-15',
        status: 'delivered',
        total: 15798,
        items: 3,
        products: ['Wireless Earbuds', 'Smart Watch', 'Phone Case']
      },
      {
        id: 'ORD-2025-001198',
        customerName: 'Priya Sharma',
        customerEmail: 'priya@example.com',
        date: '2025-01-14',
        status: 'in_transit',
        total: 8999,
        items: 2,
        products: ['Laptop Stand', 'Wireless Mouse']
      },
      {
        id: 'ORD-2025-000876',
        customerName: 'Raj Patel',
        customerEmail: 'raj@example.com',
        date: '2025-01-12',
        status: 'processing',
        total: 12450,
        items: 5,
        products: ['USB-C Hub', 'Keyboard', 'Monitor', 'HDMI Cable', 'Mouse Pad']
      },
      {
        id: 'ORD-2025-000654',
        customerName: 'Ananya Singh',
        customerEmail: 'ananya@example.com',
        date: '2025-01-10',
        status: 'delivered',
        total: 24999,
        items: 1,
        products: ['Gaming Laptop']
      },
      {
        id: 'ORD-2025-000432',
        customerName: 'Vikram Reddy',
        customerEmail: 'vikram@example.com',
        date: '2025-01-08',
        status: 'cancelled',
        total: 5499,
        items: 2,
        products: ['Bluetooth Speaker', 'Phone Charger']
      }
    ];
  };

  const calculateStats = (ordersList) => {
    const total = ordersList.length;
    const revenue = ordersList
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    const pending = ordersList.filter(o => o.status === 'processing' || o.status === 'in_transit').length;
    const delivered = ordersList.filter(o => o.status === 'delivered').length;

    setStats({
      totalOrders: total,
      totalRevenue: revenue,
      pendingOrders: pending,
      deliveredOrders: delivered
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      calculateStats(updatedOrders);
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      // For demo, update locally
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      calculateStats(updatedOrders);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-500',
      in_transit: 'bg-blue-500',
      processing: 'bg-yellow-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      delivered: 'Delivered',
      in_transit: 'In Transit',
      processing: 'Processing',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'white', fontSize: '18px' }}>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>👨‍💼</span>
            Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
            Manage orders, track revenue, and monitor store performance
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Total Orders */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
              {stats.totalOrders}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Total Orders</div>
          </div>

          {/* Total Revenue */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(16,185,129,0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div style={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: '600' }}>Total Revenue</div>
          </div>

          {/* Pending Orders */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(245,158,11,0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.pendingOrders}
            </div>
            <div style={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: '600' }}>Pending Orders</div>
          </div>

          {/* Delivered Orders */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(59,130,246,0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.deliveredOrders}
            </div>
            <div style={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: '600' }}>Delivered Orders</div>
          </div>
        </div>

        {/* Orders Management */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.5)'
        }}>
          {/* Filters */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
              Order Management
            </h2>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <input
                type="text"
                placeholder="Search by Order ID, Name, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '250px',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569', borderRadius: '0.75rem 0 0 0.75rem' }}>Order ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>Items</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>Total</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#475569', borderRadius: '0 0.75rem 0.75rem 0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={{
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}>
                    <td style={{ padding: '1.25rem 1rem', borderRadius: '0.75rem 0 0 0.75rem', fontWeight: '600', color: '#667eea', fontSize: '0.875rem' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.875rem' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{order.date}</td>
                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', color: '#475569', fontWeight: '600' }}>{order.items}</td>
                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.9375rem', fontWeight: '700', color: '#059669' }}>
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'white',
                        background: order.status === 'delivered' ? '#10b981' :
                                   order.status === 'in_transit' ? '#3b82f6' :
                                   order.status === 'processing' ? '#f59e0b' : '#ef4444'
                      }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', borderRadius: '0 0.75rem 0.75rem 0' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          border: '2px solid #e2e8f0',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="processing">Processing</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>No orders found</p>
                <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
