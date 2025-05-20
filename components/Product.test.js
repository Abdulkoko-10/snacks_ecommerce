import React from 'react';
import { render, screen } from '@testing-library/react';
import Product from './Product'; // Assuming Product.jsx is in the same directory
import { StateContext } from '../context/StateContext'; // Product might not use it, but good for consistency if other components do

// Mock next/link
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);

// Mock urlFor from lib/client as it's used in Product component
jest.mock('../lib/client', () => ({
  urlFor: jest.fn((source) => {
    if (source && source.asset && source.asset._ref) {
      // A very simplified mock, returning a placeholder string
      return `https://cdn.sanity.io/images/projectid/dataset/${source.asset._ref.replace('image-', '').replace('-webp', '.webp')}`;
    }
    if (source && source[0] && source[0].asset && source[0].asset._ref){ // If image is an array
       return `https://cdn.sanity.io/images/projectid/dataset/${source[0].asset._ref.replace('image-', '').replace('-webp', '.webp')}`;
    }
    return 'test-image-url.jpg'; // Fallback
  }),
}));

const mockProductData = {
  image: [{ asset: { _ref: 'image-xxxx-webp' } }], // Mock Sanity image asset structure
  name: 'Test Snack',
  slug: { current: 'test-snack' },
  price: 100,
};

describe('Product Component', () => {
  test('renders product name and price', () => {
    render(
      // Providing minimal context if Product doesn't directly use it, but good practice
      <StateContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
        <Product product={mockProductData} />
      </StateContext.Provider>
    );

    expect(screen.getByText('Test Snack')).toBeInTheDocument();
    // In the Product component, price is displayed as "N{price}"
    expect(screen.getByText('N100')).toBeInTheDocument(); 
  });

  test('has the correct class for styling (.product-card)', () => {
    render(
      <StateContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
        <Product product={mockProductData} />
      </StateContext.Provider>
    );
    
    // The product card is the div inside the Link. We can find it by its content.
    const productCard = screen.getByText('Test Snack').closest('div');
    expect(productCard).toHaveClass('product-card');
  });

  test('renders product image with correct src and alt (alt is not explicitly set in Product.jsx, so we check src)', () => {
    render(
      <StateContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
        <Product product={mockProductData} />
      </StateContext.Provider>
    );

    const productImage = screen.getByRole('img');
    expect(productImage).toBeInTheDocument();
    // Check if urlFor was called and generated a URL (actual URL depends on mock implementation)
    expect(productImage).toHaveAttribute('src', expect.stringContaining('xxxx.webp'));
    // Alt text is not set in the Product component, so it won't be present
    // expect(productImage).toHaveAttribute('alt', 'Test Snack'); 
  });

  test('product card links to the correct product slug', () => {
    render(
      <StateContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
        <Product product={mockProductData} />
      </StateContext.Provider>
    );

    // The link is the parent of the product card content
    const linkElement = screen.getByText('Test Snack').closest('a');
    expect(linkElement).toHaveAttribute('href', `/product/${mockProductData.slug.current}`);
  });
});
