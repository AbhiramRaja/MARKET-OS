import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import OrderService from '../services/OrderService';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState({ userId: null, email: '', name: '' });
  const [orderData, setOrderData] = useState({
    address: { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' },
    delivery: 'standard',
    payment: { method: 'card', cardNumber: '', expiryDate: '', cvv: '', upiId: '' }
  });

  useEffect(() => {
    const getUserInfo = async () => {
      if (user) {
        try {
          const session = await fetchAuthSession();
          const userId = session.userSub;
          const email = user.signInDetails?.loginId || '';
          const name = user.username || email.split('@')[0];
          setUserInfo({ userId, email, name });
          if (!orderData.address.fullName) {
            setOrderData(prev => ({ ...prev, address: { ...prev.address, fullName: name } }));
          }
        } catch (error) {
          console.error('Error getting user info:', error);
        }
      }
    };
    getUserInfo();
  }, [user]);

  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
  }, [cart, navigate]);

  const total = getCartTotal();
  const deliveryFee = orderData.delivery === 'express' ? 50 : 0; // Express delivery ₹50, Standard free
  const tax = total * 0.18;
  const finalTotal = total + tax + deliveryFee;

  const handleInputChange = (section, field, value) => {
    // If field is null, update the section directly (for simple values like delivery)
    if (field === null) {
      setOrderData(prev => ({ ...prev, [section]: value }));
    } else {
      // Otherwise update nested object property
      setOrderData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!userInfo.userId) {
      alert('Please sign in to place order');
      return;
    }
    setIsProcessing(true);
    try {
      // Format order data to match OrderService expectations
      const order = {
        userId: userInfo.userId,
        cart: cart,
        shippingAddress: orderData.address,
        subtotal: total,
        deliveryFee: deliveryFee,
        total: finalTotal,
        paymentMethod: orderData.payment.method.toUpperCase(), // Convert to uppercase: 'card' -> 'CARD', 'cod' -> 'COD'
        deliveryType: orderData.delivery.toUpperCase(), // Convert to uppercase: 'express' -> 'EXPRESS', 'standard' -> 'STANDARD'
        customerEmail: userInfo.email || 'guest@marketos.com'
      };

      console.log('Placing order:', order);
      const result = await OrderService.createOrder(order);
      console.log('Order result:', result);
      
      // OrderService returns the created order directly, not a wrapper object
      if (result && result.id) {
        clearCart();
        navigate(`/order-confirmation/${result.id}`);
      } else {
        throw new Error('Failed to create order - no order ID returned');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, title: 'Delivery', icon: '📦' },
    { id: 2, title: 'Payment', icon: '💳' },
    { id: 3, title: 'Review', icon: '✓' }
  ];

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.875rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    background: '#f9fafb'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Secure Checkout</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>Complete your order in 3 simple steps</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 'bold',
                    background: currentStep >= step.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                    color: currentStep >= step.id ? 'white' : '#6b7280',
                    boxShadow: currentStep >= step.id ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ marginLeft: '0.75rem', fontWeight: '700', fontSize: '1.125rem', color: currentStep >= step.id ? '#667eea' : '#6b7280' }}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '80px', height: '4px', marginLeft: '1.5rem', marginRight: '1.5rem', borderRadius: '2px',
                    background: currentStep > step.id ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                    transition: 'all 0.3s ease'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: currentStep === 3 ? '1fr' : '2fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            {/* Step 1: Delivery */}
            {currentStep === 1 && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>📍</span>Delivery Information
                  </h2>
                  <p style={{ color: '#64748b' }}>Enter your shipping details</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Full Name *</label>
                    <input type="text" value={orderData.address.fullName} onChange={(e) => handleInputChange('address', 'fullName', e.target.value)}
                      style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Phone Number *</label>
                    <input type="tel" value={orderData.address.phone} onChange={(e) => handleInputChange('address', 'phone', e.target.value)}
                      style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Address Line 1 *</label>
                  <input type="text" value={orderData.address.addressLine1} onChange={(e) => handleInputChange('address', 'addressLine1', e.target.value)}
                    style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="House No., Building Name" />
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Address Line 2</label>
                  <input type="text" value={orderData.address.addressLine2} onChange={(e) => handleInputChange('address', 'addressLine2', e.target.value)}
                    style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="Road Name, Area, Colony" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>City *</label>
                    <input type="text" value={orderData.address.city} onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                      style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="Mumbai" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>State *</label>
                    <input type="text" value={orderData.address.state} onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                      style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Pincode *</label>
                    <input type="text" value={orderData.address.pincode} onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                      style={inputStyle} onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }} placeholder="400001" />
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🚚</span>Delivery Speed
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { value: 'express', name: '⚡ Express', time: '1-2 days', price: '₹100' },
                      { value: 'standard', name: '📦 Standard', time: '3-5 days', price: 'Free' }
                    ].map((option) => (
                      <div key={option.value} onClick={() => handleInputChange('delivery', null, option.value)}
                        style={{
                          padding: '1.25rem', borderRadius: '1rem',
                          border: orderData.delivery === option.value ? '2px solid #667eea' : '2px solid #e5e7eb',
                          background: orderData.delivery === option.value ? 'linear-gradient(135deg, #f0f4ff 0%, #e9ecff 100%)' : 'white',
                          cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative'
                        }}
                        onMouseOver={(e) => {
                          if (orderData.delivery !== option.value) {
                            e.currentTarget.style.borderColor = '#cbd5e0';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (orderData.delivery !== option.value) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}>
                        {orderData.delivery === option.value && (
                          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '24px', height: '24px', borderRadius: '50%',
                            background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>✓</div>
                        )}
                        <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>{option.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>{option.time}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#667eea' }}>{option.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>💳</span>Payment Method
                  </h2>
                  <p style={{ color: '#64748b' }}>Choose your preferred payment option</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { value: 'card', name: 'Credit/Debit Card', icon: '💳' },
                    { value: 'upi', name: 'UPI', icon: '📱' },
                    { value: 'cod', name: 'Cash on Delivery', icon: '💵' }
                  ].map((method) => (
                    <div key={method.value} onClick={() => handleInputChange('payment', 'method', method.value)}
                      style={{
                        padding: '1.5rem', borderRadius: '1rem',
                        border: orderData.payment.method === method.value ? '2px solid #667eea' : '2px solid #e5e7eb',
                        background: orderData.payment.method === method.value ? 'linear-gradient(135deg, #f0f4ff 0%, #e9ecff 100%)' : 'white',
                        cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'center', position: 'relative'
                      }}
                      onMouseOver={(e) => {
                        if (orderData.payment.method !== method.value) {
                          e.currentTarget.style.borderColor = '#cbd5e0';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (orderData.payment.method !== method.value) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}>
                      {orderData.payment.method === method.value && (
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '24px', height: '24px', borderRadius: '50%',
                          background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>✓</div>
                      )}
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{method.icon}</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1e293b' }}>{method.name}</div>
                    </div>
                  ))}
                </div>

                {orderData.payment.method === 'card' && (
                  <div style={{ padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: '2px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>Card Information</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Card Number</label>
                      <input type="text" value={orderData.payment.cardNumber} onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                        style={{ ...inputStyle, background: 'white' }} onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} placeholder="1234 5678 9012 3456" maxLength="19" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Expiry Date</label>
                        <input type="text" value={orderData.payment.expiryDate} onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                          style={{ ...inputStyle, background: 'white' }} onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} placeholder="MM/YY" maxLength="5" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>CVV</label>
                        <input type="text" value={orderData.payment.cvv} onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                          style={{ ...inputStyle, background: 'white' }} onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} placeholder="123" maxLength="3" />
                      </div>
                    </div>
                  </div>
                )}

                {orderData.payment.method === 'upi' && (
                  <div style={{ padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: '2px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>UPI Information</h3>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>UPI ID</label>
                      <input type="text" value={orderData.payment.upiId} onChange={(e) => handleInputChange('payment', 'upiId', e.target.value)}
                        style={{ ...inputStyle, background: 'white' }} onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} placeholder="yourname@upi" />
                    </div>
                  </div>
                )}

                {orderData.payment.method === 'cod' && (
                  <div style={{ padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '2px solid #fed7aa', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💵</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#92400e' }}>Cash on Delivery</h3>
                    <p style={{ color: '#78350f', fontSize: '0.9375rem' }}>Pay when you receive your order. Keep exact change ready!</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>✓</span>Review Your Order
                  </h2>
                  <p style={{ color: '#64748b' }}>Verify all details before placing your order</p>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid #86efac', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📍</span>Delivery Address
                  </h3>
                  <div style={{ color: '#15803d', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: '700' }}>{orderData.address.fullName}</div>
                    <div>{orderData.address.phone}</div>
                    <div>{orderData.address.addressLine1}</div>
                    {orderData.address.addressLine2 && <div>{orderData.address.addressLine2}</div>}
                    <div>{orderData.address.city}, {orderData.address.state} - {orderData.address.pincode}</div>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '2px solid #93c5fd', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💳</span>Payment Method
                  </h3>
                  <div style={{ color: '#1e3a8a', fontSize: '0.9375rem', fontWeight: '600' }}>
                    {orderData.payment.method === 'card' && 'Credit/Debit Card'}
                    {orderData.payment.method === 'upi' && 'UPI Payment'}
                    {orderData.payment.method === 'cod' && 'Cash on Delivery'}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'white', border: '2px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🛒</span>Order Items ({cart.length})
                  </h3>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>{item.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Qty: {item.quantity || 1}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#667eea' }}>₹{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              {currentStep > 1 && (
                <button onClick={() => { setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ padding: '1rem 2rem', borderRadius: '0.875rem', border: '2px solid #e5e7eb', background: 'white', color: '#475569', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  ← Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button onClick={() => { setCurrentStep(currentStep + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ padding: '1rem 2.5rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
                    fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginLeft: 'auto', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)', transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'; }}>
                  Continue →
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={isProcessing}
                  style={{
                    padding: '1rem 2.5rem', borderRadius: '0.875rem', border: 'none',
                    background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white', fontWeight: '700', fontSize: '1rem', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    marginLeft: 'auto', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                  onMouseOver={(e) => { if (!isProcessing) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)'; } }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'; }}>
                  {isProcessing ? (
                    <>
                      <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>🎉</span>Place Order
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 3 && (
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', height: 'fit-content', position: 'sticky', top: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🛒</span>Order Summary
              </h3>

              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Qty: {item.quantity || 1}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#667eea' }}>₹{item.price}</div>
                </div>
              ))}

              <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b' }}>
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b' }}>
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ borderTop: '2px solid #667eea', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Total</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.875rem', fontWeight: '600' }}>
                  <span>🔒</span><span>Secure Checkout</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                  Your payment information is encrypted
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
