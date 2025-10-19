import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { BrowserRouter } from 'react-router-dom';

// Mock CartContext
const mockCart = {
  addToCart: jest.fn(),
  updateQuantity: jest.fn(),
  getItemQuantity: () => 0
};

jest.mock('../../../context/CartContext', () => ({
  useCart: () => mockCart
}));

describe('ProductCard', () => {
  it('renders product info and Add to Cart button', () => {
    const product = { id: 'p1', name: 'Test Product', price: 1999 };
    render(
      <BrowserRouter>
        <ProductCard product={product} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Add to Cart/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Add to Cart/i));
    expect(mockCart.addToCart).toHaveBeenCalled();
  });
});
