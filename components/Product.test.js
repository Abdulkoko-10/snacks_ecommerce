import React from 'react';
import { render, screen } from '@testing-library/react';
import Product from './Product';

// Mock next/link
jest.mock('next/link', () => {
  const LinkMock = ({ children, href }) => <a href={href}>{children}</a>;
  LinkMock.displayName = 'Link';
  return LinkMock;
});

// Mock urlFor from lib/client as it's used in Product component
jest.mock('../lib/client', () => ({
  urlFor: jest.fn((source) => {
    if (source && source.asset && source.asset._ref) {
      return `https://cdn.sanity.io/images/projectid/dataset/${source.asset._ref.replace('image-', '').replace('-webp', '.webp')}`;
    }
    if (source && source[0] && source[0].asset && source[0].asset._ref){
       return `https://cdn.sanity.io/images/projectid/dataset/${source[0].asset._ref.replace('image-', '').replace('-webp', '.webp')}`;
    }
    return 'test-image-url.jpg';
  }),
}));

const mockProductData = {
  image: [{ asset: { _ref: 'image-xxxx-webp' } }],
  name: 'Test Snack',
  slug: { current: 'test-snack' },
  price: 100,
};

describe('Product Component', () => {
  test('renders product name and price', () => {
    render(<Product product={mockProductData} />);
    expect(screen.getByText('Test Snack')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  test('has the correct class for styling (.product-card)', () => {
    const { container } = render(<Product product={mockProductData} />);
    expect(container.querySelector('.product_card')).toBeInTheDocument();
  });

  test('renders product image with correct src and alt', () => {
    render(<Product product={mockProductData} />);
    const productImage = screen.getByRole('img');
    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute('src', expect.stringContaining('xxxx.webp'));
    expect(productImage).toHaveAttribute('alt', 'Test Snack');
  });

  test('product card links to the correct product slug', () => {
    render(<Product product={mockProductData} />);
    const linkElement = screen.getByText('Test Snack').closest('a');
    expect(linkElement).toHaveAttribute('href', `/product/${mockProductData.slug.current}`);
  });
});
