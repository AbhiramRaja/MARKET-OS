import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import RouteMap from '../components/RouteMap';
import OrderService from '../services/OrderService';

const DriversPage = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedDeliveryForMap, setSelectedDeliveryForMap] = useState(null);
  const [driverInfo, setDriverInfo] = useState({
    name: 'Driver Name',
    vehicleType: 'Bike',
    rating: 4.8,
    completedDeliveries: 127,
    earnings: 45670
  });
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    activeDeliveries: 0,
    pendingPickups: 0
  });

  useEffect(() => {
    loadDriverData();
    
    // Subscribe to new orders in real-time
    const newOrderSubscription = OrderService.subscribeToNewOrders((newOrder) => {
      console.log('New order notification:', newOrder);
      // Add new order to deliveries list
      const newDelivery = OrderService.transformOrderToDelivery(newOrder);
      setDeliveries(prev => [newDelivery, ...prev]);
      calculateStats([newDelivery, ...deliveries]);
      
      // Show notification to driver
      if (Notification.permission === 'granted') {
        new Notification('New Delivery Available! 🚚', {
          body: `Order #${newOrder.id.slice(-6)} - ₹${newOrder.total}`,
          icon: '🚚'
        });
      }
    });

    // Subscribe to order updates
    const updateSubscription = OrderService.subscribeToOrderUpdates((updatedOrder) => {
      console.log('Order updated:', updatedOrder);
      const updatedDelivery = OrderService.transformOrderToDelivery(updatedOrder);
      setDeliveries(prev => prev.map(d => 
        d.id === updatedOrder.id ? updatedDelivery : d
      ));
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (newOrderSubscription) {
        newOrderSubscription.unsubscribe();
      }
      if (updateSubscription) {
        updateSubscription.unsubscribe();
      }
    };
  }, []);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      // Fetch real orders from backend
      const orders = await OrderService.getDeliveries();
      console.log('Loaded deliveries from backend:', orders);
      setDeliveries(orders);
      calculateStats(orders);
    } catch (error) {
      console.error('Error loading driver data:', error);
      // Fallback to empty array if API fails
      setDeliveries([]);
      setStats({
        todayDeliveries: 0,
        todayEarnings: 0,
        activeDeliveries: 0,
        pendingPickups: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deliveryList) => {
    const today = deliveryList.filter(d => d.pickupTime); // Today's deliveries
    const todayCompleted = today.filter(d => d.status === 'completed');
    const active = deliveryList.filter(d => d.status === 'picked');
    const pending = deliveryList.filter(d => d.status === 'available');

    setStats({
      todayDeliveries: todayCompleted.length,
      todayEarnings: todayCompleted.reduce((sum, d) => sum + d.amount, 0),
      activeDeliveries: active.length,
      pendingPickups: pending.length
    });
  };

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      // Update to accepted status (you may want to add this status to your backend)
      const updatedDeliveries = deliveries.map(d =>
        d.id === deliveryId ? { ...d, status: 'accepted' } : d
      );
      setDeliveries(updatedDeliveries);
      alert('Delivery accepted! Navigate to pickup location.');
    } catch (error) {
      console.error('Error accepting delivery:', error);
      alert('Failed to accept delivery. Please try again.');
    }
  };

  const handlePickupComplete = async (deliveryId) => {
    try {
      // Update order status to IN_TRANSIT in backend
      await OrderService.markAsPickedUp(deliveryId);
      
      // Update local state
      const updatedDeliveries = deliveries.map(d =>
        d.id === deliveryId ? { ...d, status: 'picked' } : d
      );
      setDeliveries(updatedDeliveries);
      calculateStats(updatedDeliveries);
      alert('Package picked up! Navigate to delivery location.');
    } catch (error) {
      console.error('Error marking pickup complete:', error);
      alert('Failed to update pickup status. Please try again.');
    }
  };

  const handleDeliveryComplete = async (deliveryId) => {
    try {
      // Update order status to DELIVERED in backend
      await OrderService.markAsDelivered(deliveryId);
      
      // Update local state
      const updatedDeliveries = deliveries.map(d =>
        d.id === deliveryId ? { 
          ...d, 
          status: 'completed', 
          completedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) 
        } : d
      );
      setDeliveries(updatedDeliveries);
      calculateStats(updatedDeliveries);
      alert('Delivery completed! Great job! 🎉');
    } catch (error) {
      console.error('Error marking delivery complete:', error);
      alert('Failed to complete delivery. Please try again.');
    }
  };

  const handleShowMap = (delivery) => {
    setSelectedDeliveryForMap(delivery);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#3b82f6',
      accepted: '#f59e0b',
      picked: '#10b981',
      completed: '#6366f1'
    };
    return colors[status] || '#9ca3af';
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Available',
      accepted: 'Accepted',
      picked: 'In Transit',
      completed: 'Delivered'
    };
    return labels[status] || status;
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeTab === 'available') return delivery.status === 'available';
    if (activeTab === 'active') return delivery.status === 'accepted' || delivery.status === 'picked';
    if (activeTab === 'completed') return delivery.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'white', fontSize: '18px' }}>Loading Driver Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>🚚</span>
            Driver Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
            Manage your deliveries and track your earnings
          </p>
        </div>

        {/* Driver Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Today's Deliveries */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
              {stats.todayDeliveries}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Today's Deliveries</div>
          </div>

          {/* Today's Earnings */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(251,191,36,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.25rem' }}>
              ₹{stats.todayEarnings}
            </div>
            <div style={{ color: '#78350f', fontSize: '0.875rem', fontWeight: '600' }}>Today's Earnings</div>
          </div>

          {/* Active Deliveries */}
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(59,130,246,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚴</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.25rem' }}>
              {stats.activeDeliveries}
            </div>
            <div style={{ color: '#1e3a8a', fontSize: '0.875rem', fontWeight: '600' }}>Active Deliveries</div>
          </div>

          {/* Pending Pickups */}
          <div style={{
            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(236,72,153,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9f1239', marginBottom: '0.25rem' }}>
              {stats.pendingPickups}
            </div>
            <div style={{ color: '#831843', fontSize: '0.875rem', fontWeight: '600' }}>Available Orders</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          {[
            { id: 'available', label: 'Available', icon: '🆕' },
            { id: 'active', label: 'Active', icon: '🚴' },
            { id: 'completed', label: 'Completed', icon: '✅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: 'none',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' 
                  : 'transparent',
                color: activeTab === tab.id ? '#059669' : 'white',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                transform: activeTab === tab.id ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Deliveries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredDeliveries.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '1.5rem',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                No {activeTab} deliveries
              </p>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {activeTab === 'available' && 'Check back soon for new delivery requests'}
                {activeTab === 'active' && 'Accept a delivery to get started'}
                {activeTab === 'completed' && 'Complete deliveries to see them here'}
              </p>
            </div>
          ) : (
            filteredDeliveries.map((delivery) => (
              <div key={delivery.id} style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease'
              }}>
                {/* Delivery Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                        {delivery.id}
                      </h3>
                      <span style={{
                        padding: '0.375rem 0.875rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'white',
                        background: getStatusColor(delivery.status)
                      }}>
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Order: {delivery.orderId}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669', marginBottom: '0.25rem' }}>
                      ₹{delivery.amount}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{delivery.distance}</div>
                  </div>
                </div>

                {/* Pickup & Delivery Info */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>📍</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
                        PICKUP LOCATION
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>
                        {delivery.pickupLocation}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        Pickup by: {delivery.pickupTime}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>🎯</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
                        DELIVERY LOCATION
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>
                        {delivery.deliveryLocation}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        Est. delivery: {delivery.estimatedDelivery}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                        👤 {delivery.customerName}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        📱 {delivery.customerPhone}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      📦 {delivery.items} items
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {delivery.status === 'available' && (
                    <>
                      <button
                        onClick={() => handleAcceptDelivery(delivery.id)}
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          padding: '1rem 1.5rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.875rem',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <span>✓</span>
                        <span>Accept Delivery</span>
                      </button>
                      <button
                        onClick={() => handleShowMap(delivery)}
                        style={{
                          minWidth: '150px',
                          padding: '1rem 1.5rem',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          color: '#475569',
                          border: '2px solid #cbd5e0',
                          borderRadius: '0.875rem',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>🗺️</span>
                        <span>View Route</span>
                      </button>
                    </>
                  )}

                  {delivery.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => handlePickupComplete(delivery.id)}
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          padding: '1rem 1.5rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.875rem',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span>📦</span>
                        <span>Confirm Pickup</span>
                      </button>
                      <button 
                        onClick={() => handleShowMap(delivery)}
                        style={{
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        color: '#475569',
                        border: '2px solid #cbd5e0',
                        borderRadius: '0.875rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      >
                        🗺️ Navigate
                      </button>
                    </>
                  )}

                  {delivery.status === 'picked' && (
                    <>
                      <button
                        onClick={() => handleDeliveryComplete(delivery.id)}
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          padding: '1rem 1.5rem',
                          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.875rem',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span>✓</span>
                        <span>Complete Delivery</span>
                      </button>
                      <button 
                        onClick={() => handleShowMap(delivery)}
                        style={{
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        color: '#475569',
                        border: '2px solid #cbd5e0',
                        borderRadius: '0.875rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      >
                        🗺️ View Route
                      </button>
                      <button 
                        onClick={() => window.open(`tel:${delivery.customerPhone}`)}
                        style={{
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        color: '#475569',
                        border: '2px solid #cbd5e0',
                        borderRadius: '0.875rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      >
                        📞 Call Customer
                      </button>
                    </>
                  )}

                  {delivery.status === 'completed' && (
                    <div style={{
                      flex: 1,
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                      borderRadius: '0.875rem',
                      textAlign: 'center',
                      border: '2px solid #86efac'
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#15803d' }}>
                        Delivered at {delivery.completedAt}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Route Map Modal */}
      {selectedDeliveryForMap && (
        <RouteMap
          pickup={{
            lat: selectedDeliveryForMap.pickupCoords.lat,
            lng: selectedDeliveryForMap.pickupCoords.lng,
            address: selectedDeliveryForMap.pickupLocation
          }}
          delivery={{
            lat: selectedDeliveryForMap.deliveryCoords.lat,
            lng: selectedDeliveryForMap.deliveryCoords.lng,
            address: selectedDeliveryForMap.deliveryLocation
          }}
          onClose={() => setSelectedDeliveryForMap(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DriversPage;
