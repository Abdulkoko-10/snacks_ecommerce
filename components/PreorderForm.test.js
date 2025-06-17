import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreorderForm from './PreorderForm';

// Mock Clerk's useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

// Default mock user data
const mockUser = {
  id: 'user_123xyz',
  fullName: 'Test User FullName',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  primaryEmailAddress: {
    emailAddress: 'test@example.com',
  },
};

describe('PreorderForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
    // Default to signed-in user
    require('@clerk/nextjs').useUser.mockReturnValue({ isSignedIn: true, user: mockUser });
  });

  // Helper to fill the form
  const fillForm = () => {
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Testland' } });
    fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Some notes here' } });
  };
   const fillFormWithoutProductName = () => {
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Testland' } });
    fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Some notes here' } });
  };


  // Test Cases will go here

  test('renders correctly when user is signed in', () => {
    render(<PreorderForm />);
    expect(screen.getByText(/pre-order form/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit pre-order/i })).toBeInTheDocument();

    // Check if user info is displayed
    expect(screen.getByText(`User ID: ${mockUser.id}`)).toBeInTheDocument();
    expect(screen.getByText(`Name: ${mockUser.fullName}`)).toBeInTheDocument();
    expect(screen.getByText(`Email: ${mockUser.primaryEmailAddress.emailAddress}`)).toBeInTheDocument();
  });

  test('renders message to log in when user is not signed in', () => {
    require('@clerk/nextjs').useUser.mockReturnValue({ isSignedIn: false, user: null });
    render(<PreorderForm />);
    expect(screen.getByText(/please log in to place a pre-order/i)).toBeInTheDocument();
    expect(screen.queryByText(/pre-order form/i)).not.toBeInTheDocument();
  });

  test('pre-fills product name and disables input if initialProductName is provided', () => {
    const initialProduct = "Awesome Gadget";
    render(<PreorderForm initialProductName={initialProduct} />);
    const productNameInput = screen.getByLabelText(/product name/i);
    expect(productNameInput).toHaveValue(initialProduct);
    expect(productNameInput).toBeDisabled();
  });

  test('updates form fields on user input', () => {
    render(<PreorderForm />);
    fillForm();
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(2);
    expect(screen.getByLabelText(/street/i)).toHaveValue('123 Main St');
    // ... check other fields
  });

  test('shows validation errors for required fields on submit if empty', async () => {
    render(<PreorderForm />);
    // Clear product name as it might be pre-filled by default in some tests
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    await waitFor(() => {
      expect(screen.getByText('Product name is required.')).toBeInTheDocument();
      expect(screen.getByText('Street address is required.')).toBeInTheDocument();
      expect(screen.getByText('City is required.')).toBeInTheDocument();
      expect(screen.getByText('Postal code is required.')).toBeInTheDocument();
      expect(screen.getByText('Country is required.')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows validation error for quantity less than 1', async () => {
    render(<PreorderForm />);
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    await waitFor(() => {
      expect(screen.getByText('Quantity must be at least 1.')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('handles successful form submission', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: 'preorder_123', message: 'Success!' }),
    });

    render(<PreorderForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/createPreorder', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mockUser.id,
          userName: mockUser.fullName,
          userEmail: mockUser.primaryEmailAddress.emailAddress,
          productName: 'Test Product',
          quantity: 2,
          shippingAddress: {
            street: '123 Main St',
            city: 'Testville',
            postalCode: '12345',
            country: 'Testland',
          },
          notes: 'Some notes here',
        }),
      }));
    });

    await waitFor(() => {
        expect(screen.getByText('Pre-order submitted successfully!')).toBeInTheDocument();
      });

    // Check if form is cleared (example: product name, quantity)
    // Note: productName might reset to initialProductName if provided, or empty if not.
    // For this test, initialProductName is not provided, so it should be empty.
    expect(screen.getByLabelText(/product name/i)).toHaveValue('');
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(1); // Resets to default 1
    expect(screen.getByLabelText(/street/i)).toHaveValue('');
  });

  test('handles successful form submission when initialProductName is provided', async () => {
    const initialProduct = "Fixed Product";
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: 'preorder_456', message: 'Success!' }),
    });

    render(<PreorderForm initialProductName={initialProduct} />);
    // Don't fill product name as it's pre-filled and disabled
    fillFormWithoutProductName();
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/createPreorder', expect.objectContaining({
        body: JSON.stringify(expect.objectContaining({
          productName: initialProduct, // Should use the initial product name
        })),
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Pre-order submitted successfully!')).toBeInTheDocument();
    });

    // Product name should remain the initial product name
    expect(screen.getByLabelText(/product name/i)).toHaveValue(initialProduct);
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(1); // Resets to default 1
  });


  test('handles failed form submission (API error)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API Error: Something went wrong' }),
    });

    render(<PreorderForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('API Error: Something went wrong')).toBeInTheDocument();
    });

    // Form should not be cleared
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Test Product');
    expect(screen.getByRole('button', { name: /submit pre-order/i })).not.toBeDisabled();
  });

  test('handles network error during form submission', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Network failed')); // Simulate network error

    render(<PreorderForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    // Form should not be cleared
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Test Product');
    expect(screen.getByRole('button', { name: /submit pre-order/i })).not.toBeDisabled();
  });

});
