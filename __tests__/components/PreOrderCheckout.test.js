// __tests__/components/PreOrderCheckout.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreOrderCheckout from '../../components/PreOrderCheckout'; // Adjust path
import { useStateContext } from '../../context/StateContext';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

jest.mock('../../context/StateContext', () => ({
  useStateContext: jest.fn(),
}));
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
}));
jest.mock('../../lib/client', () => ({ // For urlFor
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    url: jest.fn().mockReturnValue('http://image.url/mock.jpg'),
  })),
}));

global.fetch = jest.fn();

describe('<PreOrderCheckout />', () => {
  let mockRouter, mockStateContext, mockUseUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn() };
    mockStateContext = {
      cartItems: [{ _id: '1', name: 'Product 1', price: 100, quantity: 1, image: [{_key: 'imgKey', asset: {_ref: 'ref'}}]}],
      totalPrice: 100,
      totalQuantities: 1,
      setCartItems: jest.fn(),
      setTotalPrice: jest.fn(),
      setTotalQuantities: jest.fn(),
    };
    mockUseUser = {
      isSignedIn: true,
      isLoaded: true,
      user: { id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] },
    };

    useStateContext.mockReturnValue(mockStateContext);
    useUser.mockReturnValue(mockUseUser);
    useRouter.mockReturnValue(mockRouter);
  });

  it('renders cart items and allows pre-order submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Pre-order successful' }),
    });

    render(<PreOrderCheckout />);

    expect(screen.getByText('Confirm Your Pre-Order')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: $100.00')).toBeInTheDocument();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Testland' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Pre-Order & Notify Me/i }));

    expect(toast.loading).toHaveBeenCalledWith('Processing your pre-order...');
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/createPreOrder', expect.any(Object)));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Pre-order placed successfully!'));
    await waitFor(() => expect(mockStateContext.setCartItems).toHaveBeenCalledWith([]));
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/success?pre-order=true'));
  });

  it('redirects if cart is empty', () => {
    useStateContext.mockReturnValue({ ...mockStateContext, cartItems: [], totalQuantities: 0 });
    render(<PreOrderCheckout />);
    expect(toast.error).toHaveBeenCalledWith('Your cart is empty. Add items to pre-order.');
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('redirects if user is not signed in', () => {
    useUser.mockReturnValue({ ...mockUseUser, isSignedIn: false });
    render(<PreOrderCheckout />);
    expect(toast.error).toHaveBeenCalledWith('Please sign in to proceed with your pre-order.');
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('shows error toast if API call fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    });
    render(<PreOrderCheckout />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Testland' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Pre-Order & Notify Me/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error: API Error'));
  });
});
