import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import StockBadge from '../components/common/StockBadge';
import productsMock from '../mock/products.json';
import ProductService from '../services/ProductService';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
  };

  const tabs = [
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'reviews', label: 'Reviews (89)', icon: '⭐' },
    { id: 'specs', label: 'Specifications', icon: '📋' },
    { id: 'seller', label: 'Seller Info', icon: '🏪' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <Link to="/search" className="hover:text-indigo-600">Search</Link>
            <span>›</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              {/* Main Image */}
              <div className="mb-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-8xl mb-4">
                  {productImages[selectedImage]}
                </div>
                
                {/* Thumbnail Images */}
                <div className="flex gap-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl ${
                        selectedImage === index 
                          ? 'border-indigo-600 bg-indigo-50' 
                          : 'border-gray-300 bg-gray-100'
                      }`}
                    >
                      {img}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg">★★★★☆</span>
                  <span className="ml-2 text-sm text-gray-600">4.2 (89 reviews)</span>
                </div>
              </div>

              {/* Stock Badge */}
              <div className="mb-4">
                <StockBadge stock={stock} />
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {product.discount}% off
                  </span>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  You save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Seller Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Sold by</span>
                  <span className="text-indigo-600 text-sm">View Store</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Local Store • 1.2 km away
                  </div>
                  <div>⭐ 4.3 seller rating • 500+ orders</div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="mr-3 text-gray-700">Quantity:</span>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </button>
                  </div>
                  {stock <= 10 && stock > 0 && (
                    <span className="ml-3 text-sm text-orange-600">Max: {stock}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isOutOfStock 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button 
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isOutOfStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Unavailable' : 'Buy Now'}
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Add to Wishlist ♡
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Delivery Options</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>🚚 Standard Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⚡ Express Delivery</span>
                    <span>₹99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🚗 Pickup from Store</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border">
            {/* Tab Navigation */}
            <div className="border-b">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="mb-4">
                      Experience premium quality with this amazing {product.name.toLowerCase()}. 
                      Designed with attention to detail and built to last, this product offers 
                      exceptional value for money.
                    </p>
                    <h4 className="font-medium mb-2">Key Features:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Premium quality materials</li>
                      <li>Durable construction</li>
                      <li>Modern design</li>
                      <li>Easy to use</li>
                      <li>Great value for money</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-400">★★★★☆</span>
                          <span className="ml-2 font-medium">Customer {review}</span>
                          <span className="ml-auto text-sm text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-gray-700">
                          Great product! Really satisfied with the quality and fast delivery. 
                          Would definitely recommend to others.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">General</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Brand:</span>
                          <span>MarketOS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span>{product.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span>{product.category}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Other Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Warranty:</span>
                          <span>1 Year</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Return Policy:</span>
                          <span>7 Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seller' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Store Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>📍 Local Electronics Store</div>
                        <div>📍 1.2 km from your location</div>
                        <div>📞 +91 98765 43210</div>
                        <div>⭐ 4.3 rating (500+ reviews)</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Store Policies</h4>
                      <div className="space-y-2 text-sm">
                        <div>✅ Genuine products</div>
                        <div>✅ Fast local delivery</div>
                        <div>✅ Easy returns</div>
                        <div>✅ Store pickup available</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
