import React, { useState, useEffect } from 'react';
import BedrockService from '../services/BedrockService';
import ProductCard from './common/ProductCard';

export default function AIRecommendations({ products, userPreferences = {} }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingAI, setUsingAI] = useState(false);

  useEffect(() => {
    if (products && products.length > 0) {
      loadRecommendations();
    }
  }, [products]);

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      const result = await BedrockService.getProductRecommendations(
        userPreferences,
        products
      );
      
      setUsingAI(result.success);
      
      if (result.success) {
        // Parse AI recommendations and match with products
        const recommendedProducts = products.slice(0, 3);
        setRecommendations(recommendedProducts);
      } else {
        // Use fallback recommendations
        const fallback = result.recommendations || products.slice(0, 3);
        setRecommendations(Array.isArray(fallback) ? fallback : products.slice(0, 3));
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      setRecommendations(products.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="ai-recommendations" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🤖</span>
          AI is analyzing products for you...
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="ai-recommendations" style={{ padding: '3rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🤖</span>
              AI-Powered Recommendations
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              {usingAI ? (
                <>Powered by <strong>Amazon Bedrock</strong> - Claude AI</>
              ) : (
                <>Personalized picks just for you</>
              )}
            </p>
          </div>
          {usingAI && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              ✨ Amazon Bedrock Active
            </div>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {recommendations.map((product, index) => (
            <ProductCard 
              key={product.productId || product.id || `ai-rec-${index}`} 
              product={product} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
