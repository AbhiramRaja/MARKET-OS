import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '2rem', padding: '3rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>🛒</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>Your cart is empty</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Discover amazing products and start shopping!
            </p>
            <Link
              to="/search"
              style={{
                display: 'inline-block',
                padding: '1rem 2.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.125rem',
                textDecoration: 'none',
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
              🛍️ Start Shopping
            </Link>
          </div>
        </div>
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`}</style>
      </div>
    );
  }

  const total = getCartTotal();
  const discount = appliedCoupon ? total * 0.1 : 0;
  const tax = (total - discount) * 0.18;
  const finalTotal = total + tax - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 10 });
      alert('🎉 Coupon applied! 10% discount');
    } else if (couponCode) {
      alert('❌ Invalid coupon code');
    }
  };

  const buttonStyle = {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.75rem',
    border: '2px solid transparent',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              Shopping Cart
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            style={{
              ...buttonStyle,
              background: 'rgba(239, 68, 68, 0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🗑️ Clear All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cart.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1.5rem',
                  padding: '1.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center',
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #e9ecff 100%)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} />
                  ) : (
                    '📦'
                  )}
                </div>

                {/* Product Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Product ID: {item.id}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>each</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#667eea',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', minWidth: '30px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#667eea',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Item Total & Remove */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      ...buttonStyle,
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '2px solid rgba(239, 68, 68, 0.2)',
                      padding: '0.5rem 1rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              to="/search"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: '600',
                fontSize: '1.125rem',
                textDecoration: 'none',
                padding: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateX(-5px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>📋</span>Order Summary
              </h2>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#64748b' }}>
                  <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#64748b' }}>
                  <span>Tax (18%)</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>₹{tax.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#10b981' }}>
                    <span>Discount (10%)</span>
                    <span style={{ fontWeight: '600' }}>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{ borderTop: '2px solid #667eea', paddingTop: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Total</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1.125rem',
                  borderRadius: '1rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  textAlign: 'center',
                  textDecoration: 'none',
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
                🎉 Proceed to Checkout
              </Link>

              {/* Payment Methods */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
                  We accept
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '1.75rem' }}>
                  <span style={{ filter: 'grayscale(0)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>💳</span>
                  <span style={{ filter: 'grayscale(0)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>💰</span>
                  <span style={{ filter: 'grayscale(0)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>📱</span>
                  <span style={{ filter: 'grayscale(0)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>🏦</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🎟️</span>Have a coupon?
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.background = 'white';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{
                      ...buttonStyle,
                      background: appliedCoupon ? '#10b981' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      color: appliedCoupon ? 'white' : '#374151',
                      border: appliedCoupon ? '2px solid #10b981' : '2px solid #e5e7eb'
                    }}
                    onMouseOver={(e) => {
                      if (!appliedCoupon) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
                      }
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      if (!appliedCoupon) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {appliedCoupon ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', background: '#d1fae5', fontSize: '0.875rem', color: '#166534', fontWeight: '600' }}>
                    ✓ Coupon "{appliedCoupon.code}" applied!
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                  💡 Try "SAVE10" for 10% off
                </div>
              </div>

              {/* Security Badge */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontSize: '0.875rem', fontWeight: '600' }}>
                  <span>🔒</span><span>Secure Checkout</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                  Your data is protected with SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
