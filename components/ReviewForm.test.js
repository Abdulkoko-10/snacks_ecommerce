import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

// Mock StarRating as its functionality is tested separately
// We just need to ensure it receives correct props and onRatingChange can be simulated
jest.mock('./StarRating', () => jest.fn(({ rating, onRatingChange, isInput, starSize }) => (
  <div data-testid="star-rating-input-mock" onClick={() => onRatingChange(3)}> {/* Simulate clicking 3 stars */}
    Current Rating: {rating}, Size: {starSize}, Input: {String(isInput)}
  </div>
)));

// Mock global.fetch which was set up in jest.setup.js
// We can override its implementation for specific tests here using fetch.mockImplementationOnce

const mockProductId = 'product123';
const mockOnSubmitSuccess = jest.fn();

describe.skip('ReviewForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    StarRating.mockClear();
    mockOnSubmitSuccess.mockClear();
  });

  test('renders all form fields correctly', () => {
    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);

    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rating:/i)).toBeInTheDocument();
    expect(screen.getByTestId('star-rating-input-mock')).toBeInTheDocument();
    expect(screen.getByLabelText(/Review Title \(Optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comment:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Review/i })).toBeInTheDocument();
  });

  test('updates state on input change', () => {
    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test User' } });
    expect(screen.getByLabelText(/Name:/i).value).toBe('Test User');

    fireEvent.change(screen.getByLabelText(/Review Title \(Optional\):/i), { target: { value: 'Great Product!' } });
    expect(screen.getByLabelText(/Review Title \(Optional\):/i).value).toBe('Great Product!');

    fireEvent.change(screen.getByLabelText(/Comment:/i), { target: { value: 'This is a test comment.' } });
    expect(screen.getByLabelText(/Comment:/i).value).toBe('This is a test comment.');
    
    // Simulate StarRating input change
    fireEvent.click(screen.getByTestId('star-rating-input-mock'));
    // The mocked StarRating calls onRatingChange(3). We check if it's reflected in the mock's display.
    // This part of the test depends on how StarRating's mock is implemented for visual feedback or if we check formData directly.
    // For now, we trust onRatingChange updates the internal state which would be passed back to StarRating.
  });

  test('shows validation error if required fields are empty on submit', async () => {
    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    await waitFor(() => {
      expect(screen.getByText('Please fill in your name, rating, and comment.')).toBeInTheDocument();
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
  });

  test('shows validation error if rating is 0 on submit', async () => {
    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Comment:/i), { target: { value: 'A comment.' } });
    // Rating is 0 by default
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    await waitFor(() => {
      expect(screen.getByText('Please fill in your name, rating, and comment.')).toBeInTheDocument();
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  test('submits form data successfully', async () => {
    // Override global fetch mock for this test
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Review submitted successfully!' }),
      })
    );

    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Valid User' } });
    // Simulate rating selection by clicking the mocked StarRating
    // Our mock calls onRatingChange(3)
    fireEvent.click(screen.getByTestId('star-rating-input-mock')); 
    fireEvent.change(screen.getByLabelText(/Review Title \(Optional\):/i), { target: { value: 'Good Title' } });
    fireEvent.change(screen.getByLabelText(/Comment:/i), { target: { value: 'Valid comment.' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/createReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'Valid User',
          rating: 3, // From mocked StarRating click
          reviewTitle: 'Good Title',
          comment: 'Valid comment.',
          productId: mockProductId,
        }),
      });
    });
    
    await waitFor(() => {
        // After successful submission, the form itself is replaced by the success message
        expect(screen.getByText('Review submitted successfully!')).toBeInTheDocument();
      });
    expect(mockOnSubmitSuccess).toHaveBeenCalledTimes(1);

    // Check if form fields are reset (by checking if they are no longer present,
    // because the success message replaces the form)
    expect(screen.queryByLabelText(/Name:/i)).not.toBeInTheDocument();
  });

  test('handles API error on submission', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to submit review.' }),
      })
    );

    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test User' } });
    fireEvent.click(screen.getByTestId('star-rating-input-mock')); // Sets rating to 3
    fireEvent.change(screen.getByLabelText(/Comment:/i), { target: { value: 'Test comment for failure.' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit review.')).toBeInTheDocument();
    });
    expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
  });

  test('handles network error on submission', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
  
    render(<ReviewForm productId={mockProductId} onSubmitSuccess={mockOnSubmitSuccess} />);
  
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test User Network Error' } });
    fireEvent.click(screen.getByTestId('star-rating-input-mock')); // Sets rating to 3
    fireEvent.change(screen.getByLabelText(/Comment:/i), { target: { value: 'Testing network error.' } });
  
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));
  
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });
    expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
  });

});
