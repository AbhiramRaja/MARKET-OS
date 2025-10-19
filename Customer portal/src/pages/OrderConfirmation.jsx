import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OrderService from '../services/OrderService';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const order = await OrderService.getOrderById(orderId);
        
        if (order) {
          setOrderData(order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '2rem', padding: '3rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid #667eea', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
          <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: '600' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '2rem', padding: '3rem', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'shake 0.5s ease-in-out' }}>😕</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>{error || 'Order not found'}</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>We couldn't find the order you're looking for.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '1rem 2.5rem',
              borderRadius: '1rem',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.125rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  const generateQRCode = (orderId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}`;
  };

  const handleTrackOrder = () => {
    navigate(`/track/${orderData.id}`);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const buttonStyle = {
    width: '100%',
    padding: '1rem 1.5rem',
    borderRadius: '1rem',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Success Header with Animation */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInDown 0.6s ease-out' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
            animation: 'scaleIn 0.5s ease-out 0.3s both'
          }}>
            <svg style={{ width: '50px', height: '50px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', animation: 'fadeIn 0.6s ease-out 0.4s both' }}>
            Order Confirmed! 🎉
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', animation: 'fadeIn 0.6s ease-out 0.5s both' }}>
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column - Order Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Order Info Card */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', animation: 'slideInLeft 0.6s ease-out' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>📋</span>Order Details
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f0f4ff 0%, #e9ecff 100%)', border: '2px solid #dbe4ff' }}>
                  <p style={{ fontSize: '0.875rem', color: '#667eea', fontWeight: '700', marginBottom: '0.5rem' }}>ORDER NUMBER</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>{orderData.id}</p>
                </div>
                <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid #d1fae5' }}>
                  <p style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '700', marginBottom: '0.5rem' }}>ORDER DATE</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>{new Date(orderData.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '2px solid #fed7aa' }}>
                  <p style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: '700', marginBottom: '0.5rem' }}>TOTAL AMOUNT</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ₹{orderData.total.toLocaleString()}
                  </p>
                </div>
                <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '2px solid #86efac' }}>
                  <p style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '700', marginBottom: '0.5rem' }}>STATUS</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981', textTransform: 'capitalize' }}>{orderData.status}</p>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛒</span>Items Ordered ({orderData.items.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orderData.items.map((item, index) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.25rem',
                      borderRadius: '1rem',
                      background: index % 2 === 0 ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' : 'white',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>{item.name}</p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          <span style={{ fontWeight: '600' }}>Quantity:</span> {item.quantity}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem' }}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', animation: 'slideInLeft 0.6s ease-out 0.2s both' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>📍</span>Shipping Address
              </h2>
              <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid #86efac' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#166534', marginBottom: '0.75rem' }}>
                  {orderData.shippingAddress.fullName}
                </p>
                <div style={{ color: '#15803d', fontSize: '1rem', lineHeight: '1.8' }}>
                  <p>{orderData.shippingAddress.addressLine1}</p>
                  {orderData.shippingAddress.addressLine2 && <p>{orderData.shippingAddress.addressLine2}</p>}
                  <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}</p>
                  <p style={{ marginTop: '0.75rem', fontWeight: '600' }}>📞 {orderData.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
            {/* QR Code Card */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', textAlign: 'center', animation: 'slideInRight 0.6s ease-out' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>📱</span>Quick Access
              </h3>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '1rem' }}>
                <img 
                  src={generateQRCode(orderData.id)} 
                  alt="Order QR Code"
                  style={{ width: '200px', height: '200px', margin: '0 auto', border: '3px solid #667eea', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)' }}
                />
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>
                Scan to track your order
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Save this QR code for easy access
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', animation: 'slideInRight 0.6s ease-out 0.1s both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={handleTrackOrder}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Track Your Order
                </button>
                
                <button
                  onClick={handleContinueShopping}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    color: '#374151',
                    border: '2px solid #e5e7eb'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🛍️ Continue Shopping
                </button>
                
                <button
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    color: '#166534',
                    border: '2px solid #86efac'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #a7f3d0 0%, #86efac 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Receipt
                </button>
              </div>
            </div>

            {/* Next Steps */}
            <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', border: '2px solid #93c5fd', animation: 'slideInRight 0.6s ease-out 0.2s both' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✨</span>What's Next?
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginTop: '0.5rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: '#1e3a8a', fontWeight: '500' }}>You'll receive an email confirmation shortly</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginTop: '0.5rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: '#1e3a8a', fontWeight: '500' }}>We'll notify you when your order ships</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginTop: '0.5rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: '#1e3a8a', fontWeight: '500' }}>Track your package in real-time</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', marginTop: '0.5rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: '#1e3a8a', fontWeight: '500' }}>Rate your experience after delivery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', animation: 'fadeIn 0.6s ease-out 0.8s both' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>Need Help?</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1rem' }}>Our customer support team is here to assist you 24/7</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f0f4ff 0%, #e9ecff 100%)', border: '2px solid #dbe4ff' }}>
                <svg style={{ width: '24px', height: '24px', color: '#667eea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span style={{ fontSize: '1rem', color: '#374151', fontWeight: '600' }}>support@marketos.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid #d1fae5' }}>
                <svg style={{ width: '24px', height: '24px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span style={{ fontSize: '1rem', color: '#374151', fontWeight: '600' }}>1-800-MARKET-OS</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OrderConfirmation;
