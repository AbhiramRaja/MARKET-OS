import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import StockBadge from './StockBadge';

export default function ProductCard({ product }){
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  
  // Handle both id and productId formats
  const productId = product?.id || product?.productId || 'sample';
  const currentQuantity = getItemQuantity(productId) || 0;
  const stock = product?.stock !== undefined ? product.stock : 100; // Default to 100 if not set
  const isOutOfStock = stock === 0;
  const maxQuantity = stock;
  
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent Link navigation
    if (isOutOfStock) return; // Prevent adding if out of stock
    
    addToCart({
      id: productId,
      name: product?.name || 'Product name',
      price: product?.price || 19.99,
      quantity: 1
    });
  };
  
  const handleIncrement = (e) => {
    e.preventDefault();
    if (currentQuantity >= maxQuantity) return; // Don't exceed stock
    updateQuantity(productId, currentQuantity + 1);
  };
  
  const handleDecrement = (e) => {
    e.preventDefault();
    if (currentQuantity > 0) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  return (
    <div className="product-card" role="article" aria-label={product?.name || 'Product card'}>
      <Link to={product ? `/product/${productId}` : `/product/1`}>
        <div className="product-image">
          {product?.image ? (
            <img src={product.image} alt={product.name || 'Product image'} className="product-thumb" />
          ) : (
            <span aria-hidden="true">📦</span>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">
            {product?.name || 'Sample Product Name'}
          </h3>
          
          <div className="product-rating">
            <span style={{color: '#fbbf24', marginRight: '0.25rem'}}>★★★★☆</span>
            <span>4.2 (89)</span>
          </div>

          {/* Stock Badge */}
          <div className="mb-2">
            <StockBadge stock={stock} />
          </div>
          
          <div className="product-pricing">
            <div className="price-row">
              <span className="product-price">
                ₹{product?.price ? product.price.toLocaleString('en-IN') : '2,999'}
              </span>
              <span className="product-original-price">
                ₹{product?.originalPrice ? product.originalPrice.toLocaleString('en-IN') : '3,499'}
              </span>
              <span className="product-discount">
                {product?.discount || '17'}% off
              </span>
            </div>
          </div>

          <div>
            <span className="seller-badge">
              <span className="badge-dot"></span>
              Local • 1.2 km
            </span>
          </div>
        </div>
      </Link>

        <div className="product-actions">
        <Link 
          to={product ? `/product/${productId}` : `/product/1`}
          className="btn btn-secondary"
        >
          View Details
        </Link>
        
        {currentQuantity === 0 ? (
          <button 
            onClick={handleAddToCart}
            className={`btn ${isOutOfStock ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'}`}
            aria-label={`Add ${product?.name || 'item'} to cart`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        ) : (
          <div className="quantity-controls">
            <button 
              onClick={handleDecrement}
              className="quantity-btn quantity-minus"
              aria-label={`Decrease quantity of ${product?.name || 'item'}`}
            >
              −
            </button>
            <span className="quantity-display">{currentQuantity}</span>
            <button 
              onClick={handleIncrement}
              className="quantity-btn quantity-plus"
              aria-label={`Increase quantity of ${product?.name || 'item'}`}
              disabled={currentQuantity >= maxQuantity}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
