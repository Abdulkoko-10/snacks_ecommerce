import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import dynamic from 'next/dynamic';
import '@testing-library/jest-dom';
import ProductDetails, { getStaticPaths, getStaticProps } from '@/pages/product/[slug]';
import { StateContext } from '@/context/StateContext';
import { readClient } from '@/lib/client';

// Mock child components to simplify testing of ProductDetails page logic
jest.mock('../../../components/Product', () => {
  const MockProduct = () => <div data-testid="product-component-mock" />;
  MockProduct.displayName = 'Product';
  return MockProduct;
});
jest.mock('../../../components/StarRating', () => jest.fn((props) => (
  <div data-testid="star-rating-mock">Aggregate Rating: {props.rating} ({props.starSize}px)</div>
)));
jest.mock('../../../components/ReviewList', () => jest.fn(({ reviews }) => (
  <div data-testid="review-list-mock">
    {reviews.length} review(s) displayed
    {reviews.map(r => <p key={r._id}>{r.comment}</p>)}
  </div>
)));
jest.mock('../../../components/ReviewForm', () => jest.fn(({ productId, onSubmitSuccess }) => (
  <form data-testid="review-form-mock" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess(); }}>
    <input name="productId" type="hidden" value={productId} />
    <button type="submit">Submit Mock Review</button>
  </form>
)));

import useSWR from 'swr';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/product/test-product-slug', 
  }),
}));

// Mock SWR
jest.mock('swr');

// Mock Sanity client - relative path needed for jest.mock
jest.mock('../../../lib/client', () => ({
  readClient: {
    fetch: jest.fn(),
  },
  writeClient: {
    fetch: jest.fn(),
  },
  urlFor: jest.fn((source) => ({ 
    url: () => `https://cdn.sanity.io/images/projectid/dataset/${source?.asset?._ref || 'test-image.jpg'}`,
  })),
}));

const mockProduct = {
  _id: 'prod123',
  name: 'Test Snack',
  details: 'This is a delicious test snack.',
  price: 100,
  image: [{ asset: { _ref: 'image-xxxx' } }],
  slug: { current: 'test-snack-slug' },
};

const mockProducts = [mockProduct];

const mockReviewsData = [
  { _id: 'rev1', user: 'User A', rating: 5, comment: 'Great!', createdAt: new Date().toISOString() },
  { _id: 'rev2', user: 'User B', rating: 4, comment: 'Good.', createdAt: new Date().toISOString() },
];

const renderProductDetails = (product = mockProduct, products = mockProducts, reviews = mockReviewsData) => {
  return render(
    <StateContext>
      <ProductDetails product={product} products={products} reviews={reviews} />
    </StateContext>
  );
};


describe('ProductDetails Page - Reviews Section', () => {
  let mutateMock;
  beforeEach(() => {
    readClient.fetch.mockClear();
    mutateMock = jest.fn();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Review submitted" }) }));
    useSWR.mockReturnValue({
      data: mockReviewsData,
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });
  });

  test('renders aggregate rating correctly', () => {
    renderProductDetails();
    expect(screen.getByTestId('star-rating-mock')).toHaveTextContent('Aggregate Rating: 4.5 (20px)');
    expect(screen.getByText('(2 Reviews)')).toBeInTheDocument();
  });

  test('renders "No reviews yet" for aggregate rating if no reviews', () => {
    useSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
    renderProductDetails(mockProduct, mockProducts, []);
    expect(screen.queryByTestId('star-rating-mock')).not.toBeInTheDocument();
    expect(screen.getByText('(No reviews yet)')).toBeInTheDocument();
  });

  test('renders ReviewList with correct reviews', () => {
    renderProductDetails();
    expect(screen.getByTestId('review-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('review-list-mock')).toHaveTextContent('2 review(s) displayed');
    expect(screen.getByText('Great!')).toBeInTheDocument();
  });

  test('renders "Write a Review" button', () => {
    renderProductDetails();
    expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
  });

  test('toggles ReviewForm visibility on button click', async () => {
    renderProductDetails();
    const toggleButton = screen.getByRole('button', { name: /Write a Review/i });
    expect(screen.queryByTestId('review-form-mock')).not.toBeInTheDocument();
    
    fireEvent.click(toggleButton);

    // Wait for the dynamically imported form to appear
    const reviewForm = await screen.findByTestId('review-form-mock');
    expect(reviewForm).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Cancel Review/i);

    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('review-form-mock')).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Write a Review/i);
  });

  test('submitting review form calls onSubmitSuccess and potentially updates reviews (simulated)', async () => {
    renderProductDetails();
    const toggleButton = screen.getByRole('button', { name: /Write a Review/i });
    fireEvent.click(toggleButton); // Show the form

    // The form is mocked to call onSubmitSuccess on submit
    fireEvent.submit(screen.getByTestId('review-form-mock'));
    
    await waitFor(() => {
        expect(mutateMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStaticProps and getStaticPaths', () => {
    test('getStaticPaths returns correct paths', async () => {
      readClient.fetch.mockResolvedValue([{ slug: { current: 'snack1' } }, { slug: { current: 'snack2' } }]);
      const response = await getStaticPaths({});
      expect(response.paths).toEqual([
        { params: { slug: 'snack1' } },
        { params: { slug: 'snack2' } },
      ]);
      expect(response.fallback).toBe('blocking');
    });

    test('getStaticProps fetches product and related products', async () => {
      const params = { slug: 'test-snack-slug' };
      readClient.fetch
        .mockResolvedValueOnce(mockProduct) // For product query
        .mockResolvedValueOnce(mockProducts); // For productsQuery

      const response = await getStaticProps({ params });
      
      expect(readClient.fetch).toHaveBeenNthCalledWith(1, `*[_type == "product" && slug.current == '${params.slug}'][0]`);

      const currentProductId = mockProduct._id;
      const productsQuery = `*[_type == "product" && _id != $currentProductId] | order(_createdAt desc) [0...4]`;
      expect(readClient.fetch).toHaveBeenNthCalledWith(2, productsQuery, { currentProductId });

      expect(response.props.product).toEqual(mockProduct);
      expect(response.props.products).toEqual(mockProducts);
      expect(response.revalidate).toBe(60);
    });
  });
});
