import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetails, { getStaticPaths, getStaticProps } from '../../../pages/product/[slug]';
import { StateContext } from '../../../context/StateContext';
import { previewClient } from '../../../lib/client';
import useSWR from 'swr';

// Mock child components
jest.mock('../../../components/MayLikeProducts', () => {
    const MockMayLikeProducts = () => <div data-testid="may-like-products-mock" />;
    MockMayLikeProducts.displayName = 'MayLikeProducts';
    return MockMayLikeProducts;
});
jest.mock('../../../components/StarRating', () => jest.fn((props) => (
  <div data-testid="star-rating-mock">Aggregate Rating: {props.rating} ({props.starSize}px)</div>
)));
jest.mock('../../../components/ReviewList', () => {
    const MockReviewList = ({ reviews, productId, onReviewUpdate }) => (
        <div data-testid="review-list-mock">
            {reviews.length} review(s) displayed for product {productId}
            {reviews.map(r => <p key={r._id}>{r.comment}</p>)}
            <button onClick={onReviewUpdate}>Update</button>
        </div>
    );
    MockReviewList.displayName = 'ReviewList';
    return jest.fn(MockReviewList);
});
jest.mock('../../../components/ReviewForm', () => {
    const MockReviewForm = ({ productId, onSubmitSuccess }) => (
        <form data-testid="review-form-mock" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess(); }}>
            <input name="productId" type="hidden" value={productId} />
            <button type="submit">Submit Mock Review</button>
        </form>
    );
    MockReviewForm.displayName = 'ReviewForm';
    return jest.fn(MockReviewForm);
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/product/test-product-slug',
  }),
}));

// Mock Sanity client
jest.mock('../../../lib/client', () => ({
  previewClient: {
    fetch: jest.fn(),
  },
  urlFor: jest.fn((source) => ({
    url: () => `https://cdn.sanity.io/images/projectid/dataset/${source?.asset?._ref || 'test-image.jpg'}`,
  })),
}));

// Mock useSWR
jest.mock('swr');

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

const defaultContextValues = {
  decQty: jest.fn(),
  incQty: jest.fn(),
  qty: 1,
  onAdd: jest.fn(),
  setShowCart: jest.fn(),
};

const renderProductDetails = (product = mockProduct, products = mockProducts, contextValues = defaultContextValues) => {
  return render(
    <StateContext.Provider value={contextValues}>
      <ProductDetails product={product} products={products} />
    </StateContext.Provider>
  );
};

describe('ProductDetails Page - Reviews Section', () => {
  const mockMutateReviews = jest.fn();

  beforeEach(() => {
    previewClient.fetch.mockReset();
    useSWR.mockReset();
    mockMutateReviews.mockReset();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Review submitted" }) }));

    useSWR.mockReturnValue({
        data: mockReviewsData,
        error: null,
        isLoading: false,
        mutate: mockMutateReviews,
    });
  });

  test('renders aggregate rating correctly', () => {
    renderProductDetails();
    expect(screen.getByText('(2 Reviews)')).toBeInTheDocument();
  });

  test('renders "No reviews yet" for aggregate rating if no reviews', () => {
    useSWR.mockReturnValue({ data: [], error: null, isLoading: false, mutate: mockMutateReviews });
    renderProductDetails();
    expect(screen.getByText('(No reviews yet)')).toBeInTheDocument();
  });

  test('renders ReviewList with correct reviews', () => {
    renderProductDetails();
    expect(screen.getByTestId('review-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('review-list-mock')).toHaveTextContent('2 review(s) displayed for product prod123');
    expect(screen.getByText('Great!')).toBeInTheDocument();
  });

  test('renders "Write a Review" button', () => {
    renderProductDetails();
    expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
  });

  test('toggles ReviewForm visibility on button click', () => {
    renderProductDetails();
    const toggleButton = screen.getByRole('button', { name: /Write a Review/i });

    expect(screen.queryByTestId('review-form-mock')).not.toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('review-form-mock')).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Cancel Review/i);

    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('review-form-mock')).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Write a Review/i);
  });

  test('submitting review form calls onSubmitSuccess and re-fetches reviews', async () => {
    renderProductDetails();
    const toggleButton = screen.getByRole('button', { name: /Write a Review/i });
    fireEvent.click(toggleButton);

    const reviewForm = screen.getByTestId('review-form-mock');
    fireEvent.submit(reviewForm);
    
    await waitFor(() => {
        expect(mockMutateReviews).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStaticProps and getStaticPaths', () => {
    test('getStaticPaths returns correct paths', async () => {
      previewClient.fetch.mockResolvedValueOnce([{ slug: { current: 'snack1' } }, { slug: { current: 'snack2' } }]);
      const response = await getStaticPaths({});
      expect(response.paths).toEqual([
        { params: { slug: 'snack1' } },
        { params: { slug: 'snack2' } },
      ]);
      expect(response.fallback).toBe('blocking');
    });

    test('getStaticProps fetches product and related products', async () => {
        const params = { slug: 'test-snack-slug' };
        previewClient.fetch
          .mockResolvedValueOnce(mockProduct)
          .mockResolvedValueOnce(mockProducts);

        const response = await getStaticProps({ params });

        expect(previewClient.fetch).toHaveBeenCalledWith(expect.stringContaining(`slug.current == '${params.slug}'`));
        expect(previewClient.fetch).toHaveBeenCalledWith(expect.stringContaining(`*[_type == "product" && _id != "${mockProduct._id}"]`));

        expect(response.props.product).toEqual(mockProduct);
        expect(response.props.products).toEqual(mockProducts);
        expect(response.props.reviews).toBeUndefined();
        expect(response.revalidate).toBe(60);
      });
  });
});
