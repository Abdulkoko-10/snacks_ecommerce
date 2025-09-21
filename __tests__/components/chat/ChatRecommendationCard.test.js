import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatRecommendationCard from '../../../components/chat/ChatRecommendationCard';

// Mock next/link and next/image
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

jest.mock('next/image', () => {
  // eslint-disable-next-line @next/next/no-img-element
  return ({ src, alt }) => <img src={src} alt={alt} />;
});

describe('ChatRecommendationCard', () => {
  const mockCard = {
    canonicalProductId: 'test-product-123',
    preview: {
      title: 'Amazing Pizza',
      image: 'pizza.jpg',
      rating: 4.8,
      minPrice: 12.99,
      bestProvider: 'Pizza Palace',
      eta: '20-30 min',
      originSummary: ['Pizza', 'Italian'],
    },
    reason: 'You seem to like pizza!',
  };

  it('renders recommendation card details correctly', () => {
    render(<ChatRecommendationCard card={mockCard} />);

    // Check for text content based on Product.jsx structure
    expect(screen.getByText('Amazing Pizza')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();

    // Check for overlay tags
    expect(screen.getByText('15% off')).toBeInTheDocument(); // Mocked discount
    expect(screen.getByText('4.8')).toBeInTheDocument();

    // Check link and image
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/test-product-123');

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'pizza.jpg');
    expect(image).toHaveAttribute('alt', 'Amazing Pizza');
  });

  it('returns null if no card is provided', () => {
    const { container } = render(<ChatRecommendationCard card={null} />);
    expect(container.firstChild).toBeNull();
  });
});
