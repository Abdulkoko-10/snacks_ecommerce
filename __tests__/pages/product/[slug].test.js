import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetails, { getStaticPaths, getStaticProps } from '../../../pages/product/[slug]'; // Corrected path
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
    {reviews.map(r => (
      <div key={r._id || r.comment}>
        <p>{r.comment}{r.approved === false ? ' (Pending)' : ''}</p>
      </div>
    ))}
    <span>{reviews.length} review(s) displayed</span>
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


describe('ProductDetails Page - Reviews Section', () => {
  beforeEach(() => {
    client.fetch.mockReset();
    // Mock fetch for ReviewForm submission if it's not globally mocked sufficiently
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Review submitted" }) }));
  });

  test('renders aggregate rating correctly', () => {
    renderProductDetails();
    // Average of 5 and 4 is 4.5
    expect(screen.getByTestId('star-rating-mock')).toHaveTextContent('Aggregate Rating: 4.5 (20px)');
    expect(screen.getByText('(2 Reviews)')).toBeInTheDocument();
  });

  test('renders "No reviews yet" for aggregate rating if no reviews', () => {
    renderProductDetails(mockProduct, mockProducts, []);
    expect(screen.getByTestId('star-rating-mock')).toHaveTextContent('Aggregate Rating: 0 (20px)'); // Or however your StarRating handles 0
    expect(screen.getByText('(No reviews yet)')).toBeInTheDocument();
  });

  test('renders ReviewList with correct reviews', () => {
    renderProductDetails();
    expect(screen.getByTestId('review-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('review-list-mock')).toHaveTextContent('2 review(s) displayed');
    expect(screen.getByText('Great!')).toBeInTheDocument(); // Check for a comment
  });

  test('renders "Write a Review" button', () => {
    renderProductDetails();
    expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
  });

  test('toggles ReviewForm visibility on button click', () => {
    renderProductDetails();
    const toggleButton = screen.getByRole('button', { name: /Write a Review/i });

    // Initially, form should be hidden (or not exist if conditionally rendered as null)
    expect(screen.queryByTestId('review-form-mock')).not.toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('review-form-mock')).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Cancel Review/i);

    fireEvent.click(toggleButton);
    expect(screen.queryByTestId('review-form-mock')).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Write a Review/i);
  });

  test('submitting review form calls onSubmitSuccess and displays pending review', async () => {
    // Initial reviews are all approved (as per mockReviewsData structure, assuming they are approved)
    // No initial client.fetch call here as reviews are passed as props in renderProductDetails
    renderProductDetails(mockProduct, mockProducts, mockReviewsData);

    // Check initial state of ReviewList (all approved)
    const reviewList = screen.getByTestId('review-list-mock');
    expect(reviewList).toHaveTextContent(`${mockReviewsData.length} review(s) displayed`);
    mockReviewsData.forEach(review => {
      expect(reviewList).toHaveTextContent(review.comment);
      // Assuming mockReviewsData only contains approved reviews, so no "(Pending)"
      expect(reviewList).not.toHaveTextContent(`${review.comment} (Pending)`);
    });

    // Open the review form
    const toggleButton = screen.getByRole('button', { name: /Write a Review/i });
    fireEvent.click(toggleButton);

    // Prepare the data that will be returned when handleReviewSubmitSuccess calls client.fetch
    const newUnapprovedReview = { 
      _id: 'revNew', 
      user: 'New Reviewer', 
      rating: 5, 
      comment: 'This is my pending review', 
      approved: false, // Crucial for this test
      createdAt: new Date().toISOString() 
    };
    const reviewsAfterSubmission = [...mockReviewsData, newUnapprovedReview];
    
    // This specific mock call is for the fetch inside handleReviewSubmitSuccess
    client.fetch.mockResolvedValueOnce(reviewsAfterSubmission);

    // The ReviewForm mock calls onSubmitSuccess directly when submitted
    // Find the submit button within the mocked form and click it
    const reviewFormMock = screen.getByTestId('review-form-mock');
    const submitButtonInMock = reviewFormMock.querySelector('button[type="submit"]');
    
    expect(submitButtonInMock).toBeInTheDocument();
    fireEvent.submit(submitButtonInMock); // Simulate submitting the mocked form

    // Wait for the UI to update after onSubmitSuccess (which calls client.fetch and updates state)
    await waitFor(() => {
      // Assert that the ReviewList mock now displays the new review with pending status
      const updatedReviewList = screen.getByTestId('review-list-mock');
      expect(updatedReviewList).toHaveTextContent('This is my pending review (Pending)');
      expect(updatedReviewList).toHaveTextContent(`${reviewsAfterSubmission.length} review(s) displayed`);
      // Ensure previous reviews are still there and not marked pending
      expect(updatedReviewList).toHaveTextContent(mockReviewsData[0].comment);
      expect(updatedReviewList).not.toHaveTextContent(`${mockReviewsData[0].comment} (Pending)`);
    });

    // Verify that client.fetch was called (by handleReviewSubmitSuccess)
    // It's called once because initial reviews are passed as props.
    expect(client.fetch).toHaveBeenCalledTimes(1); 
    expect(client.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`*[_type == "review" && product._ref == "${mockProduct._id}"]`) // Check the query
    );
  });

  describe('getStaticProps and getStaticPaths', () => {
    test('getStaticPaths returns correct paths', async () => {
      client.fetch.mockResolvedValueOnce([{ slug: { current: 'snack1' } }, { slug: { current: 'snack2' } }]);
      const response = await getStaticPaths({});
      expect(response.paths).toEqual([
        { params: { slug: 'snack1' } },
        { params: { slug: 'snack2' } },
      ]);
      expect(response.fallback).toBe('blocking');
    });

    test('getStaticProps fetches product and reviews', async () => {
      const params = { slug: 'test-snack-slug' };
      client.fetch
        .mockResolvedValueOnce(mockProduct) // For product query
        .mockResolvedValueOnce(mockReviewsData) // For reviewsDataQuery
        .mockResolvedValueOnce(mockProducts); // For productsQuery (all products)

      const response = await getStaticProps({ params });
      
      expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining(`slug.\n  current == '${params.slug}'`));
      expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining(`_type == "review" && product._ref == "${mockProduct._id}"`));
      expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('*[_type == "product"]'));

      expect(response.props.product).toEqual(mockProduct);
      expect(response.props.reviews).toEqual(mockReviewsData);
      expect(response.props.products).toEqual(mockProducts);
      expect(response.revalidate).toBe(60);
    });
  });

});
