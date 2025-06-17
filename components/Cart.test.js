import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from './Cart'; // Adjust path as necessary
import { useStateContext } from '../context/StateContext'; // Adjust path
import { useUser } from '@clerk/nextjs'; // Adjust path

// Mock Clerk's useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  SignInButton: jest.fn(({ children }) => <button>{children}</button>), // Basic mock for SignInButton
}));

// Mock StateContext
jest.mock('../context/StateContext', () => ({
  useStateContext: jest.fn(),
}));

// Mock PreorderModal
jest.mock('./PreorderModal', () => {
  return jest.fn(({ isOpen, onRequestClose, productDetails }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-preorder-modal">
        <h3>Modal for: {productDetails?.name}</h3>
        <button onClick={onRequestClose}>Close Modal</button>
      </div>
    );
  });
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));


// Mock urlFor from lib/client (if not, images might break tests)
jest.mock('../lib/client', () => ({
  urlFor: jest.fn().mockReturnValue({
    url: jest.fn().mockReturnValue('http://fakeimage.com/image.png'),
    width: jest.fn().mockReturnThis(), // Chainable
  }),
}));


const mockCartItems = [
  { _id: 'item1', name: 'Product Alpha', price: 100, quantity: 1, image: [{_key: 'img1', _type: 'image', asset: {_ref: 'imageref1'}}] },
  { _id: 'item2', name: 'Product Beta', price: 50, quantity: 2, image: [{_key: 'img2', _type: 'image', asset: {_ref: 'imageref2'}}] },
];

describe('Cart', () => {
  let mockSetShowCart;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetShowCart = jest.fn();

    // Default signed-in state
    useUser.mockReturnValue({ isSignedIn: true, user: { id: 'user_signed_in' } });

    // Default context values
    useStateContext.mockReturnValue({
      cartItems: mockCartItems,
      totalPrice: 200,
      totalQuantities: 3,
      showCart: true,
      setShowCart: mockSetShowCart,
      toggleCartItemQuanitity: jest.fn(),
      onRemove: jest.fn(),
      setCartItems: jest.fn(),
      setTotalPrice: jest.fn(),
      setTotalQuantities: jest.fn(),
    });
  });

  test('renders cart items and "Pre-order This" buttons when user is signed in', () => {
    render(<Cart />);
    expect(screen.getByText('Product Alpha')).toBeInTheDocument();
    expect(screen.getByText('Product Beta')).toBeInTheDocument();

    const preorderButtons = screen.getAllByRole('button', { name: /pre-order this/i });
    expect(preorderButtons).toHaveLength(mockCartItems.length);
  });

  test('does NOT render "Pre-order This" buttons when user is not signed in', () => {
    useUser.mockReturnValue({ isSignedIn: false, user: null });
    render(<Cart />);
    expect(screen.getByText('Product Alpha')).toBeInTheDocument(); // Items still show
    expect(screen.queryAllByRole('button', { name: /pre-order this/i })).toHaveLength(0);
  });

  test('opens PreorderModal with correct product details when "Pre-order This" is clicked', () => {
    const MockedPreorderModal = require('./PreorderModal');
    render(<Cart />);

    const preorderButtons = screen.getAllByRole('button', { name: /pre-order this/i });
    fireEvent.click(preorderButtons[0]); // Click pre-order for the first item

    // Check if PreorderModal was called with isOpen = true
    // This relies on PreorderModal being re-rendered by Cart's state update
    await waitFor(() => {
        expect(MockedPreorderModal).toHaveBeenCalledWith(
            expect.objectContaining({
              isOpen: true,
              productDetails: expect.objectContaining({
                name: mockCartItems[0].name,
                _id: mockCartItems[0]._id,
                quantity: mockCartItems[0].quantity,
              }),
            }),
            {}
          );
    });
    expect(screen.getByTestId('mock-preorder-modal')).toBeInTheDocument();
    expect(screen.getByText(`Modal for: ${mockCartItems[0].name}`)).toBeInTheDocument();
  });

  test('closes PreorderModal when its onRequestClose is triggered', async () => {
    render(<Cart />);
    const preorderButtons = screen.getAllByRole('button', { name: /pre-order this/i });
    fireEvent.click(preorderButtons[0]); // Open the modal

    await waitFor(() => {
      expect(screen.getByTestId('mock-preorder-modal')).toBeInTheDocument();
    });

    // Simulate closing the modal (e.g., by clicking its close button)
    // The mock PreorderModal has a "Close Modal" button that calls onRequestClose
    const closeModalButton = screen.getByRole('button', { name: 'Close Modal' });
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-preorder-modal')).not.toBeInTheDocument();
    });
  });

  test('displays empty cart message when cartItems is empty', () => {
    useStateContext.mockReturnValueOnce({
      ...useStateContext(), // spread previous mock return
      cartItems: [],
      totalQuantities: 0,
      totalPrice: 0,
    });
    render(<Cart />);
    expect(screen.getByText(/your shopping bag is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

});
