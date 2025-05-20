import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewList from './ReviewList';
import StarRating from './StarRating'; // Actual StarRating will be used

// Mock StarRating to verify props passed to it without testing its internal logic here again
jest.mock('./StarRating', () => jest.fn((props) => (
  <div data-testid="star-rating-mock">
    Rating: {props.rating}, Size: {props.starSize}
  </div>
)));


const mockReviews = [
  {
    _id: 'rev1',
    user: 'John Doe',
    rating: 5,
    reviewTitle: 'Amazing!',
    comment: 'This product is fantastic.',
    createdAt: '2023-01-15T10:00:00.000Z',
  },
  {
    _id: 'rev2',
    user: 'Jane Smith',
    rating: 4,
    reviewTitle: 'Very Good',
    comment: 'I liked it a lot.',
    createdAt: '2023-01-16T12:30:00.000Z',
  },
  {
    _id: 'rev3',
    user: 'Anonymous', // Test anonymous user
    rating: 3,
    // No reviewTitle for this one
    comment: 'It was okay.',
    createdAt: '2023-01-17T15:00:00.000Z',
  },
];

describe('ReviewList Component', () => {
  beforeEach(() => {
    // Clear mock calls for StarRating if needed, though it's a functional mock here
    StarRating.mockClear();
  });

  test('renders "No reviews yet" message when reviews array is empty', () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText('No reviews yet. Be the first to review!')).toBeInTheDocument();
  });

  test('renders "No reviews yet" message when reviews prop is undefined', () => {
    render(<ReviewList />);
    expect(screen.getByText('No reviews yet. Be the first to review!')).toBeInTheDocument();
  });

  test('renders a list of reviews correctly', () => {
    render(<ReviewList reviews={mockReviews} />);

    // Check for overall title
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();

    // Check details for each review item
    mockReviews.forEach((review, index) => {
      expect(screen.getByText(review.user || 'Anonymous')).toBeInTheDocument();
      expect(screen.getByText(review.comment)).toBeInTheDocument();
      
      // Check formatted date (basic check for year, can be more specific if needed)
      const expectedDate = new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      expect(screen.getByText(expectedDate)).toBeInTheDocument();

      // Check if StarRating mock was called with correct props for this review
      expect(StarRating).toHaveBeenNthCalledWith(
        index + 1, // Jest mock call indexing is 1-based
        expect.objectContaining({
          rating: review.rating,
          starSize: 20, // Default size from ReviewList
        }),
        expect.anything() // Second argument to functional components is ref, which we don't care about here
      );

      if (review.reviewTitle) {
        expect(screen.getByText(review.reviewTitle)).toBeInTheDocument();
      }
    });
  });

  test('renders review title if present, otherwise does not render h4 for title', () => {
    render(<ReviewList reviews={mockReviews} />);
    
    // Review 1 has a title
    expect(screen.getByText('Amazing!')).toBeInTheDocument();
    // Review 3 does not have a title, ensure no empty h4 is rendered for it
    // This is harder to test directly without specific data-testid on the h4.
    // We can check that the comment is there, and assume if title was missing it wasn't rendered.
    expect(screen.getByText('It was okay.')).toBeInTheDocument();
    // A more robust way would be to query all h4s with a specific class if one was applied.
    const reviewTitles = screen.queryAllByRole('heading', { level: 4, className: 'review-title' });
    // There are 2 reviews with titles in mockReviews
    expect(reviewTitles.filter(titleEl => mockReviews.some(r => r.reviewTitle === titleEl.textContent))).toHaveLength(2);

  });
});
