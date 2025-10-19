// Shared API configuration for MarketOS
// This file defines the API endpoints that both customer and seller portals will use

const API_CONFIG = {
  // AWS Configuration
  AWS_REGION: process.env.REACT_APP_AWS_REGION || 'ap-south-1',
  AWS_ACCOUNT_ID: process.env.REACT_APP_AWS_ACCOUNT_ID || '387686289729',
  
  // Base API URL (will be updated after AWS deployment)
  BASE_URL: process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001',
  
  // S3 Configuration
  S3_BUCKET: process.env.REACT_APP_S3_BUCKET || 'marketos-storage-387686289729',
  
  // Feature flags
  USE_MOCK_SERVICES: process.env.REACT_APP_USE_MOCK_SERVICES === 'true',
};

// API Endpoints - shared between customer and seller apps
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile'
  },
  
  // Products (shared between customer and seller)
  PRODUCTS: {
    LIST: '/api/products',
    GET: '/api/products/:id',
    CREATE: '/api/products',        // Seller only
    UPDATE: '/api/products/:id',    // Seller only
    DELETE: '/api/products/:id',    // Seller only
    SEARCH: '/api/products/search',
    CATEGORIES: '/api/products/categories'
  },
  
  // Visual Search
  VISUAL_SEARCH: {
    ANALYZE: '/api/visual-search',
    UPLOAD: '/api/visual-search/upload'
  },
  
  // Orders
  ORDERS: {
    LIST: '/api/orders',
    GET: '/api/orders/:id',
    CREATE: '/api/orders',          // Customer only
    UPDATE_STATUS: '/api/orders/:id/status', // Seller only
    CANCEL: '/api/orders/:id/cancel'
  },
  
  // Seller specific
  SELLER: {
    DASHBOARD: '/api/seller/dashboard',
    ANALYTICS: '/api/seller/analytics',
    INVENTORY: '/api/seller/inventory'
  },
  
  // Customer specific
  CUSTOMER: {
    CART: '/api/customer/cart',
    WISHLIST: '/api/customer/wishlist',
    ADDRESSES: '/api/customer/addresses'
  }
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// Request headers
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// API Helper functions
export const buildUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace URL parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error - please check your connection',
      status: 0,
      data: null
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      status: -1,
      data: null
    };
  }
};

export default API_CONFIG;