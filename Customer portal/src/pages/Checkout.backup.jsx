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
  const [userInfo, setUserInfo] = useState({
    userId: null,
    email: '',
    name: ''
  });
  const [orderData, setOrderData] = useState({
    address: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
    },
    delivery: 'standard',
    payment: {
      method: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
    }
  });

  // Get authenticated user info
  useEffect(() => {
    const getUserInfo = async () => {
      if (user) {
        try {
          const session = await fetchAuthSession();
          const userId = session.userSub;
          const email = user.signInDetails?.loginId || '';
          const name = user.username || email.split('@')[0];
          
          setUserInfo({ userId, email, name });
          
          // Pre-fill name if empty
          if (!orderData.address.fullName) {
            setOrderData(prev => ({
              ...prev,
              address: {
                ...prev.address,
                fullName: name
              }
            }));
          }
        } catch (error) {
          console.error('Error getting user info:', error);
        }
      }
    };

    getUserInfo();
  }, [user]);


  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const total = getCartTotal();
  const deliveryFee = orderData.delivery === 'express' ? 100 : 0;
  const tax = total * 0.18;
  const finalTotal = total + deliveryFee + tax;

  const handleInputChange = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!userInfo.userId) {
      alert('Please sign in to place order');
      return;
    }

    setIsProcessing(true);

    try {
      const order = {
        userId: userInfo.userId,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price,
          image: item.image
        })),
        totalAmount: finalTotal,
        shippingAddress: orderData.address,
        deliverySpeed: orderData.delivery,
        paymentMethod: orderData.payment.method,
        status: 'processing'
      };

      const result = await OrderService.createOrder(order);
      
      if (result.success) {
        clearCart();
        navigate(`/order-confirmation/${result.orderId}`);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, title: 'Delivery', icon: '📦' },
    { id: 2, title: 'Payment', icon: '💳' },
    { id: 3, title: 'Review', icon: '✓' }
  ];


  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            Secure Checkout
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
            Complete your order in 3 simple steps
          </p>
        </div>

        {/* Progress Stepper */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {steps.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    background: currentStep >= step.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                    color: currentStep >= step.id ? 'white' : '#6b7280',
                    boxShadow: currentStep >= step.id ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                    marginLeft: '0.75rem',
                    fontWeight: '700',
                    fontSize: '1.125rem',
                    color: currentStep >= step.id ? '#667eea' : '#6b7280'
                  }}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '80px',
                    height: '4px',
                    marginLeft: '1.5rem',
                    marginRight: '1.5rem',
                    borderRadius: '2px',
                    background: currentStep > step.id 
                      ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                      : '#e5e7eb',
                    transition: 'all 0.3s ease'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Main Content */}
            <div style={{
              gridColumn: currentStep === 3 ? 'span 1' : 'span 2',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
            }}>
              {/* Step content will go here */}
              {currentStep === 1 && (
                <DeliveryStep orderData={orderData} handleInputChange={handleInputChange} />
              )}

              {currentStep === 2 && (
                <PaymentStep orderData={orderData} handleInputChange={handleInputChange} />
              )}

              {currentStep === 3 && (
                <ReviewStep orderData={orderData} cart={cart} />
              )}

              {/* Navigation Buttons */}
              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: '0.875rem',
                      border: '2px solid #e5e7eb',
                      background: 'white',
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    style={{
                      padding: '1rem 2.5rem',
                      borderRadius: '0.875rem',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      marginLeft: 'auto',
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
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    style={{
                      padding: '1rem 2.5rem',
                      borderRadius: '0.875rem',
                      border: 'none',
                      background: isProcessing 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      marginLeft: 'auto',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>🎉</span>
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            {currentStep !== 3 && (
              <OrderSummary cart={cart} total={total} deliveryFee={deliveryFee} tax={tax} finalTotal={finalTotal} />
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
}

// Delivery Step Component
function DeliveryStep({ orderData, handleInputChange }) {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>📍</span>
          Delivery Information
        </h2>
        <p style={{ color: '#64748b' }}>Enter your shipping details</p>
      </div>
      
      {/* Form fields here - will continue in next part */}
    </div>
  );
}

// Payment Step Component
function PaymentStep({ orderData, handleInputChange }) {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>💳</span>
          Payment Method
        </h2>
        <p style={{ color: '#64748b' }}>Choose your preferred payment option</p>
      </div>
      {/* Payment options here */}
    </div>
  );
}

// Review Step Component
function ReviewStep({ orderData, cart }) {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>✓</span>
          Review Your Order
        </h2>
        <p style={{ color: '#64748b' }}>Verify all details before placing your order</p>
      </div>
      {/* Review content here */}
    </div>
  );
}

// Order Summary Component
function OrderSummary({ cart, total, deliveryFee, tax, finalTotal }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.5rem',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      height: 'fit-content',
      position: 'sticky',
      top: '2rem'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🛒</span>
        Order Summary
      </h3>

      {cart.map((item) => (
        <div key={item.id} style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '0.5rem'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b', marginBottom: '0.25rem' }}>
              {item.name}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Qty: {item.quantity || 1}
            </div>
          </div>
          <div style={{ fontWeight: '700', color: '#667eea' }}>
            ₹{item.price}
          </div>
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

      <div style={{
        borderTop: '2px solid #667eea',
        paddingTop: '1rem',
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Total</span>
        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ₹{finalTotal.toFixed(2)}
        </span>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '0.875rem',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        border: '1px solid #86efac'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.875rem', fontWeight: '600' }}>
          <span>🔒</span>
          <span>Secure Checkout</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
          Your payment information is encrypted
        </div>
      </div>
    </div>
  );
}
