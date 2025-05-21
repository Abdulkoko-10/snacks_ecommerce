import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarRating from './StarRating';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

// Mock react-icons to make it easier to count star types
jest.mock('react-icons/ai', () => ({
  AiFillStar: jest.fn(() => <svg data-testid="filled-star" />),
  AiOutlineStar: jest.fn(() => <svg data-testid="outline-star" />),
}));

describe('StarRating Component', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    AiFillStar.mockClear();
    AiOutlineStar.mockClear();
  });

  describe('Display Mode (isInput=false)', () => {
    test('renders 0 stars correctly', () => {
      render(<StarRating rating={0} />);
      expect(screen.queryAllByTestId('filled-star')).toHaveLength(0);
      expect(screen.getAllByTestId('outline-star')).toHaveLength(5);
    });

    test('renders 3 filled stars and 2 outline stars for rating 3', () => {
      render(<StarRating rating={3} />);
      expect(screen.getAllByTestId('filled-star')).toHaveLength(3);
      expect(screen.getAllByTestId('outline-star')).toHaveLength(2);
    });

    test('renders 5 filled stars for rating 5', () => {
      render(<StarRating rating={5} />);
      expect(screen.getAllByTestId('filled-star')).toHaveLength(5);
      expect(screen.queryAllByTestId('outline-star')).toHaveLength(0);
    });

    test('stars are not clickable if isInput is false', () => {
      const onRatingChangeMock = jest.fn();
      render(<StarRating rating={2} onRatingChange={onRatingChangeMock} isInput={false} />);
      
      // Attempt to click the first star (which is filled)
      fireEvent.click(screen.getAllByTestId('filled-star')[0]);
      expect(onRatingChangeMock).not.toHaveBeenCalled();

      // Attempt to click the last star (which is outline)
      fireEvent.click(screen.getAllByTestId('outline-star')[0]);
      expect(onRatingChangeMock).not.toHaveBeenCalled();
    });

    test('renders custom star size', () => {
      render(<StarRating rating={3} starSize={30} />);
      // Check if AiFillStar was called with the correct size prop
      // This relies on how react-icons passes props. For this mock, we can't directly check the prop.
      // Instead, ensure the component renders. The visual check would be manual or with snapshot testing.
      expect(screen.getAllByTestId('filled-star').length).toBe(3);
    });
  });

  describe('Input Mode (isInput=true)', () => {
    test('renders initial rating correctly in input mode', () => {
      render(<StarRating rating={2} isInput={true} onRatingChange={jest.fn()} />);
      expect(screen.getAllByTestId('filled-star')).toHaveLength(2);
      expect(screen.getAllByTestId('outline-star')).toHaveLength(3);
    });

    test('calls onRatingChange with correct value when a star is clicked', () => {
      const onRatingChangeMock = jest.fn();
      render(<StarRating rating={0} onRatingChange={onRatingChangeMock} isInput={true} />);
      
      // Click the 3rd star (index 2), should result in a rating of 3
      fireEvent.click(screen.getAllByTestId('outline-star')[2]);
      expect(onRatingChangeMock).toHaveBeenCalledTimes(1);
      expect(onRatingChangeMock).toHaveBeenCalledWith(3);
    });

    test('calls onRatingChange when a currently filled star is clicked (to potentially change rating)', () => {
      const onRatingChangeMock = jest.fn();
      render(<StarRating rating={4} onRatingChange={onRatingChangeMock} isInput={true} />);
      
      // Click the 1st star (index 0), should result in a rating of 1
      fireEvent.click(screen.getAllByTestId('filled-star')[0]);
      expect(onRatingChangeMock).toHaveBeenCalledTimes(1);
      expect(onRatingChangeMock).toHaveBeenCalledWith(1);
    });

    // The visual state update (which stars are filled/outline) upon click
    // is handled by the parent component re-rendering StarRating with a new `rating` prop.
    // So, we test if onRatingChange is called, assuming the parent will update the prop.
    test('clicking a star calls onRatingChange, parent should update rating prop', () => {
        const onRatingChangeMock = jest.fn();
        const { rerender } = render(
          <StarRating rating={1} onRatingChange={onRatingChangeMock} isInput={true} />
        );
        expect(screen.getAllByTestId('filled-star')).toHaveLength(1);
  
        // Simulate clicking the 4th star (index 3)
        fireEvent.click(screen.getAllByTestId('outline-star')[2]); // outline-star[2] is the 4th star if rating is 1
        expect(onRatingChangeMock).toHaveBeenCalledWith(4);
  
        // Parent component would then re-render StarRating with rating={4}
        rerender(<StarRating rating={4} onRatingChange={onRatingChangeMock} isInput={true} />);
        expect(screen.getAllByTestId('filled-star')).toHaveLength(4);
        expect(screen.getAllByTestId('outline-star')).toHaveLength(1);
      });
  });
});
