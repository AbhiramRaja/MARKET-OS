import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

const CartContext = createContext();

export function CartProvider({ children }){
  const { user } = useAuthenticator((context) => [context.user]);
  const [userId, setUserId] = useState(null);
  const [cart, setCart] = useState([]);

  // Get user ID from Cognito
  useEffect(() => {
    const getUserId = async () => {
      if (user) {
        try {
          const session = await fetchAuthSession();
          const cognitoUserId = session.userSub;
          setUserId(cognitoUserId);
        } catch (error) {
          console.error('Error getting user session:', error);
          setUserId('guest');
        }
      } else {
        setUserId('guest');
      }
    };
    getUserId();
  }, [user]);

  // Load cart from localStorage when userId changes
  useEffect(() => {
    if (userId) {
      try {
        const cartKey = `cart_${userId}`;
        const raw = localStorage.getItem(cartKey);
        const userCart = raw ? JSON.parse(raw) : [];
        
        // If user just signed in and had items in guest cart, merge them
        if (userId !== 'guest' && userCart.length === 0) {
          const guestCartRaw = localStorage.getItem('cart_guest');
          if (guestCartRaw) {
            const guestCart = JSON.parse(guestCartRaw);
            if (guestCart.length > 0) {
              setCart(guestCart);
              // Clear guest cart after migration
              localStorage.removeItem('cart_guest');
              console.log('Migrated guest cart to user cart');
              return;
            }
          }
        }
        
        setCart(userCart);
      } catch (e) {
        console.error('Error loading cart:', e);
        setCart([]);
      }
    }
  }, [userId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      const cartKey = `cart_${userId}`;
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, userId]);

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };
  
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };
  
  const getItemQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    const quantity = item ? item.quantity : 0;
    console.log(`[CartContext] getItemQuantity for ID: "${id}" -> Quantity: ${quantity}`, { cartItems: cart.map(c => ({id: c.id, name: c.name, qty: c.quantity})) });
    return quantity;
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i=>i.id!==id));
  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((s,i)=>s + (i.price*i.quantity || 0),0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      getCartTotal, 
      getItemQuantity 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(){
  return useContext(CartContext);
}
