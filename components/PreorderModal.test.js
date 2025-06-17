import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreorderModal from './PreorderModal';

// Mock react-modal
jest.mock('react-modal', () => {
  const Modal = jest.fn(({ isOpen, onRequestClose, children, contentLabel, overlayClassName, className }) => {
    if (!isOpen) {
      return null;
    }
    return (
      <div data-testid="mock-modal" aria-label={contentLabel} className={`${className} ${overlayClassName}`}>
        {children}
        <button data-testid="mock-modal-close-overlay" onClick={onRequestClose}>Close Overlay</button>
      </div>
    );
  });
  Modal.setAppElement = jest.fn(); // Mock setAppElement
  return Modal;
});

// Mock PreorderForm
jest.mock('./PreorderForm', () => {
  return jest.fn((props) => (
    <div data-testid="mock-preorder-form">
      <p>ProductName: {props.initialProductName}</p>
      <p>ProductID: {props.initialProductId}</p>
      <p>Quantity: {props.initialQuantity}</p>
      <p>IsInModal: {props.isInModal ? 'true' : 'false'}</p>
      <button onClick={props.onPreorderSuccess}>Simulate Success</button>
    </div>
  ));
});


describe('PreorderModal', () => {
  const mockOnRequestClose = jest.fn();
  const productDetails = {
    name: 'Test Product X',
    _id: 'prod_123xyz',
    quantity: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when isOpen is true', () => {
    render(
      <PreorderModal
        isOpen={true}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByText(`Pre-order: ${productDetails.name}`)).toBeInTheDocument();
    expect(screen.getByTestId('mock-preorder-form')).toBeInTheDocument();
    expect(screen.getByLabelText('Close pre-order modal')).toBeInTheDocument(); // Close button
  });

  test('does not render when isOpen is false', () => {
    render(
      <PreorderModal
        isOpen={false}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  test('passes correct props to PreorderForm', () => {
    const MockedPreorderForm = require('./PreorderForm');
    render(
      <PreorderModal
        isOpen={true}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );

    expect(MockedPreorderForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialProductName: productDetails.name,
        initialProductId: productDetails._id,
        initialQuantity: productDetails.quantity,
        isInModal: true,
        // onPreorderSuccess is a function, so check its existence
        onPreorderSuccess: expect.any(Function),
      }),
      {} // Second argument for context, usually empty in functional components
    );

    // Also check the rendered output from the mock for confirmation
    expect(screen.getByText(`ProductName: ${productDetails.name}`)).toBeInTheDocument();
    expect(screen.getByText(`ProductID: ${productDetails._id}`)).toBeInTheDocument();
    expect(screen.getByText(`Quantity: ${productDetails.quantity}`)).toBeInTheDocument();
    expect(screen.getByText('IsInModal: true')).toBeInTheDocument();
  });

  test('calls onRequestClose when close button is clicked', () => {
    render(
      <PreorderModal
        isOpen={true}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );
    fireEvent.click(screen.getByLabelText('Close pre-order modal'));
    expect(mockOnRequestClose).toHaveBeenCalledTimes(1);
  });

  // This test depends on how react-modal internally handles overlay clicks and calls onRequestClose.
  // Our mock simulates this by providing a button.
  test('calls onRequestClose when overlay is clicked (simulated)', () => {
    render(
      <PreorderModal
        isOpen={true}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );
    // Simulate overlay click by clicking the button we added in the mock
    fireEvent.click(screen.getByTestId('mock-modal-close-overlay'));
    expect(mockOnRequestClose).toHaveBeenCalledTimes(1);
  });

  test('calls onRequestClose when PreorderForm calls onPreorderSuccess', () => {
    render(
      <PreorderModal
        isOpen={true}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );
    // Simulate PreorderForm success by clicking the button in its mock
    fireEvent.click(screen.getByText('Simulate Success'));
    expect(mockOnRequestClose).toHaveBeenCalledTimes(1);
  });

  test('has correct ARIA attributes for accessibility', () => {
    render(
      <PreorderModal
        isOpen={true}
        onRequestClose={mockOnRequestClose}
        productDetails={productDetails}
      />
    );
    expect(screen.getByTestId('mock-modal')).toHaveAttribute('aria-label', `Pre-order ${productDetails.name}`);
    expect(screen.getByLabelText('Close pre-order modal')).toBeInTheDocument();
  });

  test('sets app element for react-modal', () => {
    const Modal = require('react-modal');
    // Render the component which calls Modal.setAppElement in its module scope
    render(<PreorderModal isOpen={false} onRequestClose={() => {}} productDetails={null} />);
    expect(Modal.setAppElement).toHaveBeenCalled();
    // Check if it was called with document.body or #__next (if #__next exists)
    // This part is tricky because the actual DOM element might not be available in Jest as it is in browser
    // So, we primarily check IF it was called.
  });
});
