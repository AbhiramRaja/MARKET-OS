import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import OrderService from '../services/OrderService';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getOrderById(orderId);
      
      if (!orderData) {
        setError('Order not found');
        return;
      }

      // Verify this order belongs to the current user
      if (user) {
        const session = await fetchAuthSession();
        const userId = session.userSub;
        
        if (orderData.userId !== userId) {
          setError('You do not have permission to view this order');
          return;
        }
      }

      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const allSteps = [
      { 
        key: 'PENDING', 
        label: 'Pending', 
        icon: '⏳',
        description: 'Order received and awaiting confirmation',
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        bgColor: '#fef3c7',
        borderColor: '#f59e0b'
      },
      { 
        key: 'CONFIRMED', 
        label: 'Confirmed', 
        icon: '✅',
        description: 'Seller confirmed your order',
        gradient: 'linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6'
      },
      { 
        key: 'OUT_FOR_DELIVERY', 
        label: 'Out for Delivery', 
        icon: '🚚',
        description: 'Your order is on the way',
        gradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
        bgColor: '#e9d5ff',
        borderColor: '#8b5cf6'
      },
      { 
        key: 'DELIVERED', 
        label: 'Delivered', 
        icon: '📦',
        description: 'Order successfully delivered',
        gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        bgColor: '#d1fae5',
        borderColor: '#10b981'
      }
    ];

    const currentIndex = allSteps.findIndex(step => step.key === order?.status);
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
      cancelled: order?.status === 'CANCELLED'
    }));
  };

  const calculateEstimatedDelivery = () => {
    if (!order) return null;
    
    const orderDate = new Date(order.createdAt);
    const estimatedDays = order.deliveryType === 'EXPRESS' ? 2 : 5;
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
    
    return deliveryDate;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Order not found'}</h1>
          <Link
            to="/orders"
            className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const estimatedDelivery = calculateEstimatedDelivery();
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 100%)',
      padding: '2rem 0'
    }}>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <Link 
          to="/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <svg style={{width: '18px', height: '18px', marginRight: '8px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Orders
        </Link>

        {/* Order Header Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          padding: '2.5rem',
          marginBottom: '2rem'
        }}>
          <div className="flex justify-between items-start mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.75rem'
              }}>
                📦 Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🕐</span>
                Placed on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
              </p>
            </div>
            <div style={{
              padding: '1rem 2rem',
              background: isCancelled 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : order.status === 'DELIVERED'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : order.status === 'OUT_FOR_DELIVERY'
                ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                : order.status === 'CONFIRMED'
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '800',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
              minWidth: '180px'
            }}>
              {order.status.replace('_', ' ')}
            </div>
          </div>

          {!isCancelled && estimatedDelivery && order.status !== 'DELIVERED' && (
            <div style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
            }}>
              <span style={{ fontSize: '3rem' }}>🚀</span>
              <div>
                <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e3a8a', margin: 0 }}>
                  Estimated Delivery
                </p>
                <p style={{ fontWeight: '800', fontSize: '1.4rem', color: '#1d4ed8', margin: '0.25rem 0 0 0' }}>
                  {formatDate(estimatedDelivery)}
                </p>
              </div>
            </div>
          )}

          {order.status === 'DELIVERED' && (
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
            }}>
              <span style={{ fontSize: '3rem' }}>🎉</span>
              <div>
                <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#065f46', margin: 0 }}>
                  Delivered Successfully!
                </p>
                <p style={{ fontWeight: '600', fontSize: '1rem', color: '#047857', margin: '0.25rem 0 0 0' }}>
                  Your order has been delivered. Enjoy your purchase!
                </p>
              </div>
            </div>
          )}

          {isCancelled && (
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
            }}>
              <span style={{ fontSize: '3rem' }}>❌</span>
              <div>
                <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#991b1b', margin: 0 }}>
                  Order Cancelled
                </p>
                <p style={{ fontWeight: '600', fontSize: '1rem', color: '#b91c1c', margin: '0.25rem 0 0 0' }}>
                  This order has been cancelled
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Order Timeline */}
        {!isCancelled && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            padding: '2rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              marginBottom: '2.5rem',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Order Progress
            </h2>
            
            {/* Modern Progress Bar */}
            <div className="mb-10">
              <div className="flex justify-between items-center relative mb-4">
                {/* Progress Track */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  left: 0,
                  right: 0,
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '999px',
                  zIndex: 0
                }}></div>
                
                {/* Active Progress */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  left: 0,
                  height: '8px',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '999px',
                  zIndex: 0,
                  width: `${(statusSteps.findIndex(s => s.active) / (statusSteps.length - 1)) * 100}%`,
                  transition: 'width 0.7s ease',
                  boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)'
                }}></div>

                {/* Progress Nodes */}
                {statusSteps.map((step, index) => (
                  <div key={step.key} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    zIndex: 10, 
                    flex: 1 
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      marginBottom: '0.75rem',
                      transition: 'all 0.5s ease',
                      transform: step.completed ? 'scale(1.1)' : 'scale(1)',
                      background: step.completed ? step.gradient : '#e5e7eb',
                      color: step.completed ? 'white' : '#9ca3af',
                      boxShadow: step.completed ? '0 10px 25px rgba(0, 0, 0, 0.15)' : 'none',
                      border: step.active ? '4px solid #e9d5ff' : 'none',
                      animation: step.active ? 'pulse 2s infinite' : 'none'
                    }}>
                      {step.icon}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      maxWidth: '80px',
                      color: step.completed ? '#1f2937' : '#9ca3af',
                      transition: 'color 0.3s ease'
                    }}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Timeline */}
            <div className="space-y-6 mt-8">
              {statusSteps.map((step, index) => (
                <div key={step.key} style={{
                  borderRadius: '16px',
                  padding: '1.25rem',
                  transition: 'all 0.3s ease',
                  background: step.active 
                    ? 'rgba(255, 255, 255, 0.5)'
                    : step.completed 
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: step.active 
                    ? '2px solid rgba(168, 85, 247, 0.5)'
                    : step.completed 
                    ? '1px solid rgba(255, 255, 255, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: step.active ? '0 8px 20px rgba(168, 85, 247, 0.25)' : '0 4px 10px rgba(0, 0, 0, 0.05)'
                }}>
                  <div className="flex items-center">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      marginRight: '1rem',
                      background: step.completed ? step.gradient : 'rgba(229, 231, 235, 0.8)',
                      color: step.completed ? 'white' : '#9ca3af',
                      boxShadow: step.completed ? '0 4px 10px rgba(0, 0, 0, 0.15)' : 'none'
                    }}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 style={{
                          fontWeight: '700',
                          fontSize: '1.125rem',
                          color: step.completed ? '#1f2937' : '#6b7280'
                        }}>
                          {step.label}
                        </h3>
                        {step.active && (
                          <span style={{
                            padding: '0.25rem 1rem',
                            background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            borderRadius: '999px',
                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                          }}>
                            CURRENT
                          </span>
                        )}
                        {step.completed && !step.active && (
                          <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                        )}
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        marginTop: '0.25rem',
                        color: step.completed ? '#374151' : '#6b7280'
                      }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CSS for animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
            }
          }
        `}</style>

        {/* Order Items */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          padding: '2rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Order Items
          </h2>
          <div className="divide-y divide-white/30">
            {order.items.map((item, index) => (
              <div key={index} className="py-5 flex items-center hover:bg-white/20 rounded-lg transition-all px-4 -mx-4">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl mr-5 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400/30 to-pink-400/30 backdrop-blur-sm rounded-xl mr-5 flex items-center justify-center shadow-lg border border-white/30">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-gray-700 mt-1">
                    <span className="font-medium">Quantity:</span> {item.quantity}
                  </p>
                  <p className="text-gray-700 text-sm">₹{item.price.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-xl">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t-2 border-white/40 mt-6 pt-6 space-y-3 bg-white/20 backdrop-blur-sm rounded-xl p-5">
            <div className="flex justify-between text-gray-800 text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-800 text-lg">
              <span>Delivery Fee ({order.deliveryType})</span>
              <span className="font-semibold">₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text pt-3 border-t-2 border-white/40">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Shipping Address
            </h2>
            <div className="text-gray-800 space-y-2 bg-white/20 backdrop-blur-sm rounded-xl p-5">
              <p className="font-bold text-gray-900 text-lg">{order.shippingAddress.fullName}</p>
              <p className="text-gray-700">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-gray-700">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="text-gray-700 font-semibold">{order.shippingAddress.pincode}</p>
              <p className="pt-3 font-medium text-gray-900">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Payment Information
            </h2>
            <div className="space-y-4 bg-white/20 backdrop-blur-sm rounded-xl p-5">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Payment Method</p>
                <p className="font-bold text-gray-900 text-lg">
                  {order.paymentMethod === 'CARD' ? '💳 Card Payment' : '💵 Cash on Delivery'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Delivery Type</p>
                <p className="font-bold text-gray-900 text-lg">
                  {order.deliveryType === 'EXPRESS' ? '⚡ Express Delivery' : '📦 Standard Delivery'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Customer Email</p>
                <p className="font-bold text-gray-900">{order.customerEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          padding: '2rem'
        }}>
          <h3 className="font-bold text-gray-900 text-xl mb-3">Need Help?</h3>
          <p className="text-gray-700 mb-5 text-lg">
            If you have any questions about your order, please contact our support team.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-bold transform hover:scale-105">
              Contact Support
            </button>
            <Link 
              to="/orders"
              className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-xl hover:bg-purple-50 transition-all font-bold shadow-lg transform hover:scale-105"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;