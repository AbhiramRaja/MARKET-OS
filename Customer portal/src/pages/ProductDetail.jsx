import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import StockBadge from '../components/common/StockBadge';
import productsMock from '../mock/products.json';
import ProductService from '../services/ProductService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const p = await ProductService.getProduct(id);
        if (mounted && p) setProduct(p);

        // fetch a small list of active products for 'similar' suggestions
        const all = await ProductService.getActiveProducts();
        if (mounted && Array.isArray(all)) {
          setSimilarProducts(all.filter(x => x.id !== id).slice(0, 4));
        }
      } catch (err) {
        console.warn('Product load failed, falling back to mock', err);
        const fallback = productsMock.find(p => p.id === id) || productsMock[0];
        if (mounted) {
          setProduct(fallback);
          setSimilarProducts(productsMock.filter(p => p.id !== fallback.id).slice(0, 4));
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (!product) return <div className="p-6">Loading product...</div>;

  const stock = product?.stock !== undefined ? product.stock : 100;
  const isOutOfStock = stock === 0;
  const maxQuantity = stock;

  // Mock product images
  const productImages = [
    '📦', '📷', '🔍', '💎'
  ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (quantity > maxQuantity) {
      alert(`Only ${maxQuantity} items available in stock`);
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity
    });

    // Show toast notification
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const tabs = [
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'reviews', label: 'Reviews (89)', icon: '⭐' },
    { id: 'specs', label: 'Specifications', icon: '📋' },
    { id: 'seller', label: 'Seller Info', icon: '🏪' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification */}
      {showAddedToast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Added to Cart</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <div className="flex items-center space-x-2 text-xs">
            <Link to="/" className="text-blue-600 hover:text-orange-600 hover:underline">Home</Link>
            <span className="text-gray-400">›</span>
            <Link to="/search" className="text-blue-600 hover:text-orange-600 hover:underline">{product.category || 'Products'}</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Image Gallery - Left Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-4">
              {/* Main Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-8 mb-4">
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-9xl">
                    {productImages[selectedImage]}
                  </div>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 border rounded flex items-center justify-center text-2xl transition-all ${
                      selectedImage === index 
                        ? 'border-orange-500 border-2' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {img}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info - Middle Column */}
          <div className="lg:col-span-4">
            {/* Product Title */}
            <h1 className="text-2xl font-normal text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Brand */}
            <div className="mb-3">
              <span className="text-sm text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">
                Brand: {product.brand || 'MarketOS'}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">4.2</span>
                <div className="flex text-orange-400">
                  <span>★★★★</span><span className="text-gray-300">★</span>
                </div>
              </div>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">42,877 ratings</span>
            </div>

            {/* Badge */}
            {product.discount && product.discount > 30 && (
              <div className="mb-4">
                <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded">Amazon's Choice</span>
              </span>
              <span className="text-xs text-gray-600 ml-2">for "{product.category}"</span>
            </div>
            )}

            {/* Popularity */}
            <div className="mb-4 text-sm">
              <span className="font-medium">3K+ bought</span> in past month
            </div>

            {/* Price */}
            <div className="mb-4 bg-gray-50 p-4 rounded border border-gray-200">
              {product.discount && (
                <div className="mb-2">
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                    Great Indian Festival
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-red-700 text-sm">-{product.discount}%</span>
                <span className="text-3xl font-normal">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
              {product.originalPrice && (
                <>
                  <div className="text-sm text-gray-600">
                    M.R.P.: <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Inclusive of all taxes</div>
                </>
              )}
            </div>

            {/* Offers */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-600">💰</span>
                <span className="font-semibold text-sm">Offers</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="border border-gray-300 rounded p-3 text-xs">
                  <div className="font-semibold mb-1">Bank Offer</div>
                  <div className="text-gray-600">Upto ₹3,000.00 discount on select Credit Cards, HDFC...</div>
                </div>
                <div className="border border-gray-300 rounded p-3 text-xs">
                  <div className="font-semibold mb-1">Cashback</div>
                  <div className="text-gray-600">Upto ₹19.00 cashback as Amazon Pay Balance when...</div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-sm">About this item</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-gray-600 rounded-full flex-shrink-0"></span>
                  <span>Wireless Mouse with 2.4GHz connectivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-gray-600 rounded-full flex-shrink-0"></span>
                  <span>Silent buttons for quiet operation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-gray-600 rounded-full flex-shrink-0"></span>
                  <span>1000 DPI optical tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-gray-600 rounded-full flex-shrink-0"></span>
                  <span>18-month battery life</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-gray-600 rounded-full flex-shrink-0"></span>
                  <span>Compatible with PC, Mac, and Laptop</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buy Box - Right Column */}
          <div className="lg:col-span-3">
            <div className="border border-gray-300 rounded-lg p-4 sticky top-4">
              {/* Price */}
              <div className="mb-3">
                <span className="text-3xl font-normal">₹{product.price.toLocaleString('en-IN')}</span>
              </div>

              {/* Delivery */}
              <div className="mb-3 text-sm">
                <div className="mb-1">
                  <span className="text-blue-600">FREE delivery</span> <span className="font-semibold">Sunday, 26 October.</span> <Link to="#" className="text-blue-600 hover:text-orange-600 hover:underline">Details</Link>
                </div>
                <div>
                  Or fastest delivery <span className="font-semibold">Thursday, 23 October.</span> <Link to="#" className="text-blue-600 hover:text-orange-600 hover:underline">Details</Link>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">Delivering to Chennai 600001</span>
                    <span className="text-blue-600"> - Update location</span>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="mb-4">
                <span className="text-green-700 text-lg font-medium">In Stock</span>
              </div>

              {/* Seller Info */}
              <div className="mb-4 text-sm">
                <div className="mb-1">Ships from <span className="font-medium">Amazon</span></div>
                <div>Sold by <Link to="#" className="text-blue-600 hover:text-orange-600 hover:underline">Clicktech Retail Private Ltd</Link></div>
              </div>

              {/* Payment */}
              <div className="mb-4 text-sm">
                <div className="text-blue-600 hover:text-orange-600 hover:underline cursor-pointer">Secure transaction</div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="text-sm font-medium block mb-1">Quantity:</label>
                <select 
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 bg-gray-50"
                >
                  {[...Array(Math.min(maxQuantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded-full font-medium text-sm transition-colors"
                  disabled={isOutOfStock}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full font-medium text-sm transition-colors"
                  disabled={isOutOfStock}
                >
                  Buy Now
                </button>
              </div>

              {/* Gift Options */}
              <div className="mb-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Add gift options</span>
                </label>
              </div>

              {/* Wishlist */}
              <div className="text-sm">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="text-blue-600 hover:text-orange-600 hover:underline"
                >
                  Add to Wish List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-5 font-semibold text-sm border-b-3 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600 bg-purple-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2 text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Product Description</h3>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Experience premium quality with this amazing {product.name.toLowerCase()}. 
                      Designed with attention to detail and built to last, this product offers 
                      exceptional value for money. Perfect for everyday use and built with the finest materials.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                        <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                          <span className="text-2xl">✨</span>
                          Key Features
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="text-purple-600 text-xl flex-shrink-0">●</span>
                            <span className="text-gray-700">Premium quality materials for durability</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-purple-600 text-xl flex-shrink-0">●</span>
                            <span className="text-gray-700">Robust construction that lasts</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-purple-600 text-xl flex-shrink-0">●</span>
                            <span className="text-gray-700">Modern and elegant design</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-purple-600 text-xl flex-shrink-0">●</span>
                            <span className="text-gray-700">User-friendly and easy to use</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-purple-600 text-xl flex-shrink-0">●</span>
                            <span className="text-gray-700">Excellent value for money</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          What's Included
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">1x {product.name}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">User manual & warranty card</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">Original branded packaging</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">1 Year manufacturer warranty</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                    <button className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                      Write a Review
                    </button>
                  </div>
                  
                  {/* Rating Summary */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-xl border border-yellow-200 mb-8">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-gray-900 mb-2">4.2</div>
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-yellow-500 text-2xl">★★★★☆</span>
                        </div>
                        <div className="text-sm text-gray-600">Based on 89 reviews</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-12">{star} ★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full"
                                style={{ width: `${star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 8 : 2}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">{star === 5 ? 58 : star === 4 ? 22 : star === 3 ? 7 : 2}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {[
                      { name: 'Rajesh Kumar', rating: 5, date: '2 days ago', comment: 'Excellent product! Exceeded my expectations. Quality is top-notch and delivery was super fast. Highly recommended!' },
                      { name: 'Priya Sharma', rating: 4, date: '1 week ago', comment: 'Good quality product. Value for money. Only minor issue was packaging could be better. Overall satisfied with the purchase.' },
                      { name: 'Amit Patel', rating: 5, date: '2 weeks ago', comment: 'Amazing purchase! Exactly as described. The local store delivery was very convenient and quick. Will definitely buy again!' }
                    ].map((review, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{review.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-yellow-500 text-lg">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                                <span className="text-sm text-gray-500">• {review.date}</span>
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="text-gray-600 hover:text-purple-600 flex items-center gap-1 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Helpful (12)
                          </button>
                          <button className="text-gray-600 hover:text-purple-600 font-medium">Reply</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">📦</span>
                        General Information
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Brand', value: 'MarketOS Premium' },
                          { label: 'Model Number', value: product.id },
                          { label: 'Category', value: product.category },
                          { label: 'Color', value: 'As shown in image' },
                          { label: 'Material', value: 'Premium Quality' },
                          { label: 'Country of Origin', value: 'India' }
                        ].map((spec, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                            <span className="text-sm font-medium text-gray-600">{spec.label}</span>
                            <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">🛡️</span>
                        Warranty & Support
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Warranty Period', value: '1 Year Manufacturer' },
                          { label: 'Warranty Type', value: 'Comprehensive' },
                          { label: 'Return Policy', value: '7 Days Replacement' },
                          { label: 'Covered in Warranty', value: 'Manufacturing Defects' },
                          { label: 'Not Covered', value: 'Physical Damage' },
                          { label: 'Customer Support', value: '24/7 Available' }
                        ].map((spec, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-green-200 last:border-0">
                            <span className="text-sm font-medium text-gray-600">{spec.label}</span>
                            <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seller' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Seller Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            🏪
                          </div>
                          <div>
                            <h4 className="font-bold text-xl text-gray-900">Local Electronics Store</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Open Now
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">1.2 km away</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm">123 MG Road, Bangalore</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-sm">+91 98765 43210</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">store@localelectronics.com</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-purple-200">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white p-3 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">4.3</div>
                              <div className="text-xs text-gray-600 mt-1">Rating</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">500+</div>
                              <div className="text-xs text-gray-600 mt-1">Orders</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">98%</div>
                              <div className="text-xs text-gray-600 mt-1">Positive</div>
                            </div>
                          </div>
                        </div>

                        <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
                          Visit Store
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl border-2 border-blue-200 mb-6">
                        <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                          <span className="text-2xl">⚡</span>
                          Store Highlights
                        </h4>
                        <div className="space-y-4">
                          {[
                            { icon: '✅', title: 'Verified Seller', desc: 'Verified by MarketOS' },
                            { icon: '🚚', title: 'Fast Delivery', desc: 'Same day delivery available' },
                            { icon: '💯', title: 'Genuine Products', desc: '100% authentic products' },
                            { icon: '🔄', title: 'Easy Returns', desc: '7 days return policy' },
                            { icon: '💬', title: 'Great Support', desc: '24/7 customer support' },
                            { icon: '🏪', title: 'Store Pickup', desc: 'Free in-store pickup' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                              <span className="text-2xl flex-shrink-0">{item.icon}</span>
                              <div>
                                <div className="font-semibold text-gray-900">{item.title}</div>
                                <div className="text-sm text-gray-600">{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
                        <h4 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
                          <span className="text-2xl">🕐</span>
                          Store Timings
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                            <span className="text-gray-600">Monday - Saturday</span>
                            <span className="font-semibold text-gray-900">9:00 AM - 9:00 PM</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Sunday</span>
                            <span className="font-semibold text-gray-900">10:00 AM - 8:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">You May Also Like</h2>
              <p className="text-gray-600">Similar products that might interest you</p>
            </div>
            <Link 
              to="/search" 
              className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2 group"
            >
              View All
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
