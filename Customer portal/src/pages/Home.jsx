import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import ProductCard from '../components/common/ProductCard';
import VisualSearchModal from '../components/VisualSearchModal';
import productsMock from '../mock/products.json';
import ProductService from '../services/ProductService';

export default function Home() {
  const [shopLocal, setShopLocal] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Home', icon: '🏠' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Toys', icon: '🧸' },
    { name: 'Books', icon: '📚' },
    { name: 'Grocery', icon: '🛒' }
  ];

  const [products, setProducts] = useState(productsMock || []);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const items = await ProductService.getActiveProducts();
        if (mounted && Array.isArray(items) && items.length > 0) setProducts(items);
      } catch (err) {
        // keep mock products if API fails
        console.warn('ProductService.getActiveProducts failed, using mock data', err);
      }
    };

    // initial fetch
    fetchProducts();
    // poll every 30 seconds for product updates
    const id = setInterval(fetchProducts, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="main-content">
      <section className="hero-modern">
        <div className="hero-background-pattern"></div>
        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>India's Fastest Growing Marketplace</span>
          </div>
          
          <h1 className="hero-title">
            <span className="hero-title-line1">Shop Online or Local</span>
            <span className="hero-title-gradient">Your Choice, Your Way</span>
          </h1>
          
          <p className="hero-description">
            Discover products from both online sellers and local stores. 
            Get it shipped to your door or pick it up nearby - the choice is yours!
          </p>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">50,000+</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">4.8/5</div>
              <div className="stat-label">Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Secure</div>
            </div>
          </div>
          
          <div className="hero-cta-buttons">
            <Link to="/search" className="hero-btn-primary">
              <span>🛍️</span>
              <span>Start Shopping</span>
              <span className="btn-arrow">→</span>
            </Link>
            <button 
              onClick={() => setIsVisualSearchOpen(true)}
              className="hero-btn-secondary"
            >
              <span>📸</span>
              <span>Search by Image</span>
            </button>
          </div>
        </div>
      </section>
      
      <VisualSearchModal 
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />

      <section className="categories-section">
        <div style={{ color: '#718096', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          POPULAR CATEGORIES
        </div>
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Discover thousands of products across our most popular categories</p>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link 
              key={cat.name} 
              to={'/search?category=' + cat.name.toLowerCase()}
              className="category-card"
            >
              <span className="category-icon">{cat.icon}</span>
              <div className="category-name">{cat.name}</div>
              <div className="category-link">Shop Now →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Handpicked deals and trending items just for you</p>
          <Link to="/search" className="view-all-link">View All Products →</Link>
        </div>
        <div className="products-grid">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="best-sellers-section">
        <div className="section-header">
          <h2 className="section-title">Best Sellers</h2>
          <p className="section-subtitle">Most popular products this week</p>
        </div>
        <div className="products-horizontal-scroll">
          {(products.length >= 16 ? products.slice(8, 16) : products.slice(0, 8)).map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
