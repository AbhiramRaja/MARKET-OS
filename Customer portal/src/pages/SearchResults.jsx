import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';
import productsMock from '../mock/products.json';
import ProductService from '../services/ProductService';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState(productsMock || []);
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [sortBy, setSortBy] = useState('relevance');
  const [visualSearchLabels, setVisualSearchLabels] = useState([]);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const isVisualSearch = searchParams.get('visual') === 'true';
  const hasProducts = searchParams.get('hasProducts') === 'true';
  const confidence = parseFloat(searchParams.get('confidence')) || 0;

  // Get unique categories from products
  const availableCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const items = await ProductService.getActiveProducts();
        if (mounted && Array.isArray(items) && items.length > 0) setAllProducts(items);
      } catch (err) {
        console.warn('ProductService.getActiveProducts failed, using mock data', err);
      }
    };

    fetchProducts();
    const id = setInterval(fetchProducts, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    // start with a shallow copy of the current product list
    let filtered = allProducts.slice();

    // Check if we have Rekognition-matched products
    if (isVisualSearch && hasProducts) {
      const storedProducts = sessionStorage.getItem('visualSearchProducts');
      const storedLabels = sessionStorage.getItem('visualSearchLabels');
      
      if (storedProducts) {
        try {
          const rekognitionProducts = JSON.parse(storedProducts);
          console.log('Using Rekognition matched products:', rekognitionProducts.length);
          filtered = rekognitionProducts;
          
          // Store labels for display
          if (storedLabels) {
            setVisualSearchLabels(JSON.parse(storedLabels));
          }
        } catch (e) {
          console.error('Failed to parse stored products:', e);
        }
      }
    }
    
    // Enhanced search logic for text search or fallback
    if (query && (!isVisualSearch || !hasProducts)) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      filtered = filtered.filter(product => {
        const productText = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
        
        // For visual search, be more flexible with matching
        if (isVisualSearch) {
          // If confidence is very low, be more restrictive
          if (confidence < 0.6) {
            // Only match if there's a direct term match
            return searchTerms.some(term => productText.includes(term));
          }
          
          // For higher confidence, use category-based matching
          return searchTerms.some(term => {
            // Check for shoe/footwear related terms
            if (term.includes('footwear') || term.includes('shoes') || term.includes('sneakers') || 
                term.includes('athletic') || term.includes('running') || term.includes('sport')) {
              return productText.includes('shoe') || productText.includes('sneaker') || 
                     productText.includes('running') || product.category?.toLowerCase() === 'fashion';
            }
            // Check for fashion terms
            if (term.includes('fashion') || term.includes('style') || term.includes('trendy')) {
              return product.category?.toLowerCase() === 'fashion';
            }
            // Check for electronics
            if (term.includes('electronic') || term.includes('tech') || term.includes('gadget') || 
                term.includes('device') || term.includes('wireless')) {
              return product.category?.toLowerCase() === 'electronics';
            }
            // Check for home items
            if (term.includes('home') || term.includes('furniture') || term.includes('decor')) {
              return product.category?.toLowerCase() === 'home';
            }
            // Check for books
            if (term.includes('book') || term.includes('read') || term.includes('literature')) {
              return product.category?.toLowerCase() === 'books';
            }
            // Check for sports items
            if (term.includes('sport') || term.includes('fitness') || term.includes('gym')) {
              return product.category?.toLowerCase() === 'sports';
            }
            // Check for beauty items
            if (term.includes('beauty') || term.includes('cosmetic') || term.includes('skincare')) {
              return product.category?.toLowerCase() === 'beauty';
            }
            // For unknown/general items, only match if term appears in product text
            if (term.includes('object') || term.includes('item') || term.includes('product')) {
              return false; // Don't match generic terms
            }
            // Default: check if term appears in product text
            return productText.includes(term);
          });
        } else {
          // Regular text search - exact matching
          return searchTerms.some(term => productText.includes(term));
        }
      });
    }

    // Filter by category (from URL or checkboxes)
    if (category && !isVisualSearch) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === category.toLowerCase()
      );
    } else if (selectedCategories.length > 0 && !isVisualSearch) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter(product => 
        (product.rating || 0) >= selectedRating
      );
    }

    // Filter by stock (assuming stock property exists or all in stock)
    if (showInStockOnly) {
      filtered = filtered.filter(product => 
        product.inStock !== false && product.stock !== 0
      );
    }

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'relevance' && isVisualSearch && hasProducts) {
      // For visual search with Rekognition products, sort by match confidence
      filtered.sort((a, b) => {
        const confA = a.confidence || 0;
        const confB = b.confidence || 0;
        const matchCountA = a.matchCount || 0;
        const matchCountB = b.matchCount || 0;
        
        // First by match count, then by confidence
        if (matchCountB !== matchCountA) {
          return matchCountB - matchCountA;
        }
        return confB - confA;
      });
    }

    setFilteredProducts(filtered);
  }, [query, category, sortBy, isVisualSearch, hasProducts, priceRange, selectedCategories, selectedRating, showInStockOnly]);

  // Helper functions
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedCategories([]);
    setSelectedRating(0);
    setShowInStockOnly(false);
    setSortBy('relevance');
    setSearchParams({}); // Clear URL params
  };

  const hasActiveFilters = 
    priceRange[0] !== 0 || 
    priceRange[1] !== 10000 || 
    selectedCategories.length > 0 || 
    selectedRating > 0 || 
    showInStockOnly;

  return (
    <div className="main-content">
      {/* Search Bar Section */}
      <div className="search-header">
        <div className="search-container">
          <SearchBar initial={query} placeholder="Search products, brands, categories..." />
        </div>
      </div>

      <div className="search-results">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="clear-filters-btn"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                background: '#fee2e2',
                color: '#991b1b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ✕ Clear All Filters
            </button>
          )}

          {/* Sort By */}
          <div className="filter-section">
            <h3 className="filter-title">Sort By</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-input"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '0.9rem'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h3 className="filter-title">Price Range</h3>
            <div style={{ padding: '0.5rem 0' }}>
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            {availableCategories.map(cat => (
              <div key={cat} className="filter-option" style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  />
                  <span>{cat}</span>
                  <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '0.875rem' }}>
                    ({allProducts.filter(p => p.category === cat).length})
                  </span>
                </label>
              </div>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Customer Rating</h3>
            {[4, 3, 2, 1].map(rating => (
              <div key={rating} className="filter-option" style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === rating}
                    onChange={() => setSelectedRating(rating)}
                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {'⭐'.repeat(rating)}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                      & above
                    </span>
                  </div>
                </label>
              </div>
            ))}
            {selectedRating > 0 && (
              <button
                onClick={() => setSelectedRating(0)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear rating filter
              </button>
            )}
          </div>

          {/* In Stock Filter */}
          <div className="filter-section">
            <div className="filter-option">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                />
                <span>Show In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Main */}
        <div className="results-main">
          <div className="results-header">
            {isVisualSearch && (
              <div className="visual-search-indicator">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Visual Search Results</span>
              </div>
            )}
            <h1 className="section-title">
              {isVisualSearch ? `Visual search results` :
               query ? `Search results for "${query}"` : 
               category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 
               'All Products'}
            </h1>
            <p className="section-subtitle">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              {isVisualSearch && (
                confidence > 0.8 ? ' matching your image' :
                confidence > 0.6 ? ' - similar items found' :
                ' - broader search results (low confidence)'
              )}
            </p>
            {isVisualSearch && confidence > 0 && (
              <div className="confidence-indicator">
                <span className={`confidence-badge ${confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low'}`}>
                  {Math.round(confidence)}% match confidence
                </span>
              </div>
            )}
            
            {isVisualSearch && visualSearchLabels.length > 0 && (
              <div className="detected-labels">
                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  Detected in your image:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {visualSearchLabels.slice(0, 8).map((label, index) => (
                    <span 
                      key={index}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}
                    >
                      {label.name} ({Math.round(label.confidence)}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard key={product.id || index} product={product} />
              ))
            ) : (
              <div className="no-results">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-xl font-semibold mb-2">No products found</h2>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
