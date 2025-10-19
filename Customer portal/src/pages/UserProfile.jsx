import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

const UserProfile = () => {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    sub: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    loadUserInfo();
  }, [user]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const attributes = await fetchUserAttributes();
      
      setUserInfo({
        name: attributes.name || 'User',
        email: attributes.email || user?.signInDetails?.loginId || '',
        phone: attributes.phone_number || 'Not set',
        sub: session.userSub || ''
      });
      
      setEditForm({
        name: attributes.name || '',
        phone: attributes.phone_number || ''
      });
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updates = {
        name: editForm.name
      };
      
      if (editForm.phone && editForm.phone !== userInfo.phone) {
        updates.phone_number = editForm.phone;
      }

      await updateUserAttributes({ userAttributes: updates });
      alert('Profile updated successfully!');
      setEditing(false);
      await loadUserInfo();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock user data (keeping orders, addresses, etc. for display)
  const mockUserData = {
    profile: {
      name: userInfo.name || 'User',
      email: userInfo.email || 'user@example.com',
      phone: userInfo.phone || 'Not set',
      joinDate: '2024-01-15',
      avatar: 'https://via.placeholder.com/100x100?text=' + getInitials(userInfo.name || 'U')
    },
    orders: [
      {
        id: 'ORD-2025-001234',
        date: '2025-01-08',
        status: 'delivered',
        total: 15798,
        items: 3,
        products: ['Wireless Earbuds', 'Smart Watch', 'Phone Case']
      },
      {
        id: 'ORD-2025-001198',
        date: '2024-12-22',
        status: 'in_transit',
        total: 8999,
        items: 2,
        products: ['Laptop Stand', 'Wireless Mouse']
      },
      {
        id: 'ORD-2024-000876',
        date: '2024-12-10',
        status: 'delivered',
        total: 12450,
        items: 5,
        products: ['USB-C Hub', 'Keyboard', 'Monitor', 'HDMI Cable', 'Mouse Pad']
      }
    ],
    addresses: [
      {
        id: 1,
        type: 'Home',
        name: userInfo.name || 'User',
        address: '123 Main Street, Apt 4B',
        city: 'Mumbai',
        zipCode: '400001',
        phone: userInfo.phone || 'Not set',
        isDefault: true
      },
      {
        id: 2,
        type: 'Work',
        name: userInfo.name || 'User',
        address: '456 Business District, Floor 10',
        city: 'Mumbai',
        zipCode: '400070',
        phone: userInfo.phone || 'Not set',
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true
      },
      {
        id: 2,
        type: 'card',
        brand: 'mastercard',
        last4: '8888',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false
      }
    ],
    wishlist: [
      {
        id: 1,
        name: 'Wireless Bluetooth Earbuds',
        price: 3999,
        originalPrice: 5999,
        rating: 4.5,
        reviews: 1234,
        inStock: true
      },
      {
        id: 2,
        name: 'Smart Fitness Watch',
        price: 8999,
        originalPrice: 12999,
        rating: 4.8,
        reviews: 856,
        inStock: true
      },
      {
        id: 3,
        name: 'Premium Coffee Maker',
        price: 6999,
        originalPrice: 8999,
        rating: 4.3,
        reviews: 432,
        inStock: false
      }
    ]
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulate API call with real user data
    const fetchUserData = async () => {
      if (loading || !userInfo.email) return;
      await new Promise(resolve => setTimeout(resolve, 300));
      setUserData({
        ...mockUserData,
        profile: {
          ...mockUserData.profile,
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone
        }
      });
    };

    fetchUserData();
  }, [loading, userInfo]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      delivered: 'text-green-600 bg-green-100',
      in_transit: 'text-blue-600 bg-blue-100',
      processing: 'text-yellow-600 bg-yellow-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getCardIcon = (brand) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳'
    };
    return icons[brand] || '💳';
  };

  if (loading && !userInfo.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Header Card with Gradient */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold">
                {getInitials(userInfo.name)}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">{userInfo.name}</h2>
              <p className="text-blue-100 mb-1">{userInfo.email}</p>
              <p className="text-sm text-blue-200">Member since Oct 2025</p>
            </div>
          </div>
          <Link to="/orders" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all inline-flex items-center space-x-2">
            <span>📦</span>
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats - Modern Square Cards */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '3rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(102, 126, 234, 0.35)',
          padding: '2.5rem',
          width: '220px',
          height: '220px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) rotate(-2deg)';
          e.currentTarget.style.boxShadow = '0 25px 70px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 15px 50px rgba(102, 126, 234, 0.35)';
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span style={{fontSize: '2.5rem'}}>📦</span>
          </div>
          <div style={{fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem', textShadow: '0 4px 10px rgba(0,0,0,0.2)'}}>
            {userData.orders.length}
          </div>
          <p style={{fontSize: '1rem', fontWeight: '600', color: 'rgba(255,255,255,0.95)', margin: 0}}>Total Orders</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(245, 87, 108, 0.35)',
          padding: '2.5rem',
          width: '220px',
          height: '220px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) rotate(2deg)';
          e.currentTarget.style.boxShadow = '0 25px 70px rgba(245, 87, 108, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 15px 50px rgba(245, 87, 108, 0.35)';
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span style={{fontSize: '2.5rem'}}>❤️</span>
          </div>
          <div style={{fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem', textShadow: '0 4px 10px rgba(0,0,0,0.2)'}}>
            {userData.wishlist.length}
          </div>
          <p style={{fontSize: '1rem', fontWeight: '600', color: 'rgba(255,255,255,0.95)', margin: 0}}>Wishlist Items</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(79, 172, 254, 0.35)',
          padding: '2.5rem',
          width: '220px',
          height: '220px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) rotate(-2deg)';
          e.currentTarget.style.boxShadow = '0 25px 70px rgba(79, 172, 254, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 15px 50px rgba(79, 172, 254, 0.35)';
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span style={{fontSize: '2.5rem'}}>📍</span>
          </div>
          <div style={{fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem', textShadow: '0 4px 10px rgba(0,0,0,0.2)'}}>
            {userData.addresses.length}
          </div>
          <p style={{fontSize: '1rem', fontWeight: '600', color: 'rgba(255,255,255,0.95)', margin: 0}}>Saved Addresses</p>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="space-x-3">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold transition-colors"
              >
                {loading ? 'Saving...' : '✓ Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditForm({ name: userInfo.name, phone: userInfo.phone });
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
            <input 
              type="text" 
              value={editing ? editForm.name : userData.profile.name}
              onChange={(e) => editing && setEditForm({ ...editForm, name: e.target.value })}
              disabled={!editing}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                editing 
                  ? 'border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
            <input 
              type="email" 
              value={userData.profile.email}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 text-gray-700 rounded-xl cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Phone</label>
            <input 
              type="tel" 
              value={editing ? editForm.phone : userData.profile.phone}
              onChange={(e) => editing && setEditForm({ ...editForm, phone: e.target.value })}
              disabled={!editing}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                editing 
                  ? 'border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">User ID</label>
            <input 
              type="text" 
              value={userInfo.sub.slice(0, 20) + '...'}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-xl font-mono text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Your Orders</h2>
        <Link to="/orders" style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          View All Orders
        </Link>
      </div>
      
      {!userData || !userData.orders || userData.orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white text-xl">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {userData.orders.map((order, index) => (
            <div key={order.id || index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  flexShrink: 0
                }}>
                  📦
                </div>
                
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                    Order #{order.id}
                  </h3>
                  <p style={{ color: '#ffffff', opacity: 0.9, fontSize: '14px', marginBottom: '8px' }}>
                    📅 Placed on {order.date}
                  </p>
                  <p style={{ color: '#ffffff', opacity: 0.9, fontSize: '14px', marginBottom: '8px' }}>
                    🛍️ {order.items} items
                  </p>
                  {order.products && order.products.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ color: '#ffffff', opacity: 0.7, fontSize: '12px', marginBottom: '4px' }}>
                        Products:
                      </p>
                      <p style={{ color: '#ffffff', opacity: 0.95, fontSize: '14px', fontWeight: '500' }}>
                        {order.products.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                    ₹{order.total.toLocaleString()}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    background: order.status === 'delivered' ? '#10b981' :
                                order.status === 'in_transit' ? '#3b82f6' :
                                order.status === 'processing' ? '#f59e0b' : '#ef4444',
                    color: '#ffffff'
                  }}>
                    {order.status === 'delivered' ? '✓ DELIVERED' :
                     order.status === 'in_transit' ? '🚚 IN TRANSIT' :
                     order.status === 'processing' ? '⏳ PROCESSING' :
                     '✕ CANCELLED'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => navigate(`/track-order/${order.id}`)}
                  style={{
                    background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📍</span>
                  <span>Track Order</span>
                </button>
                <button style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👁️</span>
                  <span>View Details</span>
                </button>
                <button style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔄</span>
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddressesTab = () => (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Saved Addresses</h2>
        <button style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>➕</span>
          <span>Add New Address</span>
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {userData.addresses.map((address) => (
          <div key={address.id} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative'
          }}>
            {address.isDefault && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>⭐</span>
                <span>Default</span>
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>
                  {address.type === 'Home' ? '🏠' : address.type === 'Work' ? '🏢' : '📍'}
                </span>
                <h3 style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '20px' }}>{address.type}</h3>
              </div>
              <p style={{ fontWeight: '600', color: '#ffffff', opacity: 0.9, fontSize: '16px' }}>{address.name}</p>
            </div>
            
            <div style={{ color: '#ffffff', opacity: 0.85, marginBottom: '24px' }}>
              <p style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                <span>📮</span>
                <span>{address.address}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                <span>🏙️</span>
                <span>{address.city} - {address.zipCode}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '14px' }}>
                <span>📞</span>
                <span>{address.phone}</span>
              </p>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <button style={{
                background: '#3b82f6',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>✏️</span>
                <span>Edit</span>
              </button>
              <button style={{
                background: '#ef4444',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>🗑️</span>
                <span>Delete</span>
              </button>
              {!address.isDefault && (
                <button style={{
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>⭐</span>
                  <span>Set Default</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Payment Methods</h2>
        <button style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>➕</span>
          <span>Add New Card</span>
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {userData.paymentMethods.map((method) => (
          <div key={method.id} style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '220px'
          }}>
            {method.isDefault && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#6366f1',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>⭐</span>
                <span>Default</span>
              </div>
            )}
            
            {/* Card Chip Design */}
            <div style={{
              position: 'absolute',
              top: '64px',
              left: '24px',
              width: '48px',
              height: '40px',
              background: 'rgba(251, 191, 36, 0.6)',
              borderRadius: '4px',
              opacity: 0.7
            }}></div>
            
            <div style={{ marginBottom: '32px', marginTop: '48px' }}>
              <div style={{
                color: '#ffffff',
                opacity: 0.8,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '1px'
              }}>CARD NUMBER</div>
              <div style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}>•••• •••• •••• {method.last4}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{
                  color: '#ffffff',
                  opacity: 0.8,
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  letterSpacing: '1px'
                }}>VALID THRU</div>
                <div style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>{method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}</div>
              </div>
              <div style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '4px'
              }}>
                {method.brand === 'visa' ? 'VISA' : method.brand === 'mastercard' ? 'MC' : 'AMEX'}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <button style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#6366f1',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>✏️</span>
                <span>Edit</span>
              </button>
              <button style={{
                background: '#ef4444',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>🗑️</span>
                <span>Delete</span>
              </button>
              {!method.isDefault && (
                <button style={{
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>⭐</span>
                  <span>Set Default</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWishlistTab = () => (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Your Wishlist</h2>
        <Link to="/" style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🛍️</span>
          <span>Continue Shopping</span>
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {userData.wishlist.map((item) => (
          <div key={item.id} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {/* Product Icon/Visual */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #ec4899 100%)',
              height: '192px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '72px' }}>
                {item.name.toLowerCase().includes('earbuds') || item.name.toLowerCase().includes('headphone') ? '🎧' :
                 item.name.toLowerCase().includes('watch') ? '⌚' :
                 item.name.toLowerCase().includes('coffee') || item.name.toLowerCase().includes('maker') ? '☕' :
                 item.name.toLowerCase().includes('phone') ? '📱' :
                 item.name.toLowerCase().includes('laptop') ? '💻' :
                 '🛍️'}
              </div>
              {!item.inStock && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}>Out of Stock</span>
                </div>
              )}
              {item.originalPrice > item.price && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            
            <div style={{ padding: '20px' }}>
              <h3 style={{
                fontWeight: 'bold',
                color: '#ffffff',
                fontSize: '18px',
                marginBottom: '12px',
                minHeight: '56px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>{item.name}</h3>
              
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#fbbf24', fontSize: '14px' }}>
                      {i < Math.floor(item.rating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <span style={{ color: '#ffffff', opacity: 0.7, fontSize: '14px' }}>
                  {item.rating} ({item.reviews})
                </span>
              </div>
              
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                  ₹{item.price.toLocaleString()}
                </span>
                {item.originalPrice > item.price && (
                  <span style={{
                    fontSize: '14px',
                    color: '#ffffff',
                    opacity: 0.6,
                    textDecoration: 'line-through'
                  }}>₹{item.originalPrice.toLocaleString()}</span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {item.inStock ? (
                  <button style={{
                    width: '100%',
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    <span>🛒</span>
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <button disabled style={{
                    width: '100%',
                    background: 'rgba(107, 114, 128, 0.5)',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span>✕</span>
                    <span>Out of Stock</span>
                  </button>
                )}
                
                <button style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>❌</span>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      {/* Ultra Modern Profile Navigation */}
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          position: 'sticky',
          top: '0',
          zIndex: '1000',
          padding: '1.5rem 0'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'addresses', label: 'Addresses', icon: '📍' },
              { id: 'payment', label: 'Payment', icon: '💳' },
              { id: 'wishlist', label: 'Wishlist', icon: '❤️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)',
                  color: '#667eea',
                  padding: '1rem 2rem',
                  borderRadius: '20px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 10px 40px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  transform: 'translateY(-4px) scale(1.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '150px',
                  justifyContent: 'center'
                } : {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '150px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
              >
                <span style={{fontSize: '1.5rem'}}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10" style={{textAlign: 'center', color: 'white'}}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            marginBottom: '1rem',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-1px'
          }}>My Account</h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>Manage your profile, orders, and preferences</p>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'addresses' && renderAddressesTab()}
          {activeTab === 'payment' && renderPaymentTab()}
          {activeTab === 'wishlist' && renderWishlistTab()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;