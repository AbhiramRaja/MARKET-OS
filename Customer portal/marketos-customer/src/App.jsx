import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import UserProfile from './pages/UserProfile';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

// Configure Amplify
Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator.Provider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/track/:orderId" element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  } />
                  <Route path="/track-order/:orderId" element={<OrderTracking />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </Authenticator.Provider>
  );
}
