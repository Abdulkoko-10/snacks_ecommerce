import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetails, { getServerSideProps } from '../../../pages/product/[id]';
import { StateContext } from '../../../context/StateContext'; // Corrected path
import { client } from '../../../lib/client'; // Corrected path

// Mock child components to simplify testing of ProductDetails page logic
jest.mock('../../../components/Product', () => { // Corrected path
  const MockProduct = () => <div data-testid="product-component-mock" />;
  MockProduct.displayName = 'Product';
  return MockProduct;
});
jest.mock('../../../components/StarRating', () => jest.fn((props) => ( // Corrected path
  <div data-testid="star-rating-mock">Aggregate Rating: {props.rating} ({props.starSize}px)</div>
)));
jest.mock('../../../components/ReviewList', () => jest.fn(({ reviews }) => ( // Corrected path
  <div data-testid="review-list-mock">
    {reviews.length} review(s) displayed
    {reviews.map(r => <p key={r._id}>{r.comment}</p>)}
  </div>
)));
jest.mock('../../../components/ReviewForm', () => jest.fn(({ productId, onSubmitSuccess }) => ( // Corrected path
  <form data-testid="review-form-mock" onSubmit={() => onSubmitSuccess()}>
    <input name="productId" type="hidden" value={productId} />
    <button type="submit">Submit Mock Review</button>
  </form>
)));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/product/test-product-slug',
  }),
}));

// Mock Sanity client
jest.mock('../../../lib/client', () => ({ // Corrected path
  client: {
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
  image: [{ asset: { _ref: 'image-xxxx' } }], // Mock image asset
  slug: { current: 'test-snack-slug' },
};

const mockProducts = [mockProduct];

const mockReviewsData = [
  { _id: 'rev1', user: 'User A', rating: 5, comment: 'Great!', createdAt: new Date().toISOString() },
  { _id: 'rev2', user: 'User B', rating: 4, comment: 'Good.', createdAt: new Date().toISOString() },
];

// Default StateContext values
const defaultContextValues = {
  decQty: jest.fn(),
  incQty: jest.fn(),
  qty: 1,
  onAdd: jest.fn(),
  setShowCart: jest.fn(),
  // Add other necessary context values if ProductDetails uses them
};

const renderProductDetails = (product = mockProduct, products = mockProducts, reviews = mockReviewsData, contextValues = defaultContextValues) => {
  return render(
    <StateContext.Provider value={contextValues}>
      <ProductDetails product={product} products={products} reviews={reviews} />
    </StateContext.Provider>
  );
};


describe('getServerSideProps', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch.mockClear();
  });

  test('fetches product and returns it as a prop', async () => {
    const mockProduct = { id: '1', name: 'Test Product' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const context = { params: { id: '1' } };
    const response = await getServerSideProps(context);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/product/1');
    expect(response).toEqual({
      props: {
        product: mockProduct,
      },
    });
  });

  test('returns notFound if the product is not found', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    const context = { params: { id: '1' } };
    const response = await getServerSideProps(context);

    expect(response).toEqual({ notFound: true });
  });

  test('returns notFound on fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const context = { params: { id: '1' } };
    const response = await getServerSideProps(context);

    expect(response).toEqual({ notFound: true });
  });
});
