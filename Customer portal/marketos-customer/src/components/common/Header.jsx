import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import VisualSearchModal from '../VisualSearchModal';
import SearchBar from './SearchBar';

export default function Header() {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user name from Cognito
  useEffect(() => {
    const loadUserName = async () => {
      if (user) {
        try {
          const attributes = await fetchUserAttributes();
          setUserName(attributes.name || attributes.email?.split('@')[0] || 'User');
        } catch (error) {
          console.error('Error fetching user attributes:', error);
          setUserName(user.signInDetails?.loginId?.split('@')[0] || 'User');
        }
      }
    };
    loadUserName();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    return userName || 'User';
  };

  return (
    <>
      <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="modern-container">
          <Link to="/" className="logo-modern">
            <div className="logo-icon-wrapper">
              <span className="logo-emoji">🛒</span>
            </div>
            <span className="logo-text-modern">MarketOS</span>
          </Link>
          
          <div className="nav-search-modern">
            <SearchBar onOpenVisual={() => setIsVisualSearchOpen(true)} />
          </div>

          <nav className="modern-nav">
            <Link 
              to="/cart" 
              className={`modern-nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>
            
            {user ? (
              <div className="user-menu-container" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="modern-nav-link user-menu-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{getUserDisplayName()}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`dropdown-arrow ${showUserMenu ? 'rotate' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div className="user-info">
                        <div className="user-name">{getUserDisplayName()}</div>
                        <div className="user-email">{user?.signInDetails?.loginId}</div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="dropdown-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="dropdown-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      <span>My Orders</span>
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="dropdown-item logout-item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="modern-nav-link auth-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="modern-nav-link auth-link signup-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <VisualSearchModal 
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />
    </>
  );
}
