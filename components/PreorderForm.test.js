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
  const fillForm = (options = { fillProductName: true, quantity: '2' }) => {
    if (options.fillProductName) {
      fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'Test Product' } });
    }
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: options.quantity } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Testland' } });
    fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Some notes here' } });
  };

  // This helper is effectively replaced by fillForm({ fillProductName: false })
  // const fillFormWithoutProductName = () => {
  //   fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '2' } });
  //   fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '123 Main St' } });
  //   fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Testland' } });
    fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Some notes here' } });
  };


  test('renders correctly when user is signed in (not in modal)', () => {
    render(<PreorderForm />);
    expect(screen.getByRole('heading', { name: /pre-order form/i })).toBeInTheDocument(); // Title should be there
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(1); // Default initial quantity
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

  test('renders correctly when in modal (no title, prefilled data)', () => {
    const product = { name: 'Modal Product', id: 'modal_prod_1', quantity: 5 };
    render(
      <PreorderForm
        initialProductName={product.name}
        initialProductId={product.id}
        initialQuantity={product.quantity}
        isInModal={true}
      />
    );
    expect(screen.queryByRole('heading', { name: /pre-order form/i })).not.toBeInTheDocument(); // Title should NOT be there

    const productNameInput = screen.getByLabelText(/product name/i);
    expect(productNameInput).toHaveValue(product.name);
    expect(productNameInput).toBeDisabled(); // Disabled due to initialProductName/Id

    expect(screen.getByLabelText(/quantity/i)).toHaveValue(product.quantity);
  });


  test('renders message to log in when user is not signed in', () => {
    require('@clerk/nextjs').useUser.mockReturnValue({ isSignedIn: false, user: null });
    render(<PreorderForm />);
    expect(screen.getByText(/please log in to place a pre-order/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /pre-order form/i })).not.toBeInTheDocument();
  });

  test('pre-fills product name and disables input if initialProductName and initialProductId are provided', () => {
    const initialProduct = "Awesome Gadget";
    const initialId = "ag_001";
    render(<PreorderForm initialProductName={initialProduct} initialProductId={initialId} />);
    const productNameInput = screen.getByLabelText(/product name/i);
    expect(productNameInput).toHaveValue(initialProduct);
    expect(productNameInput).toBeDisabled();
  });

  test('pre-fills quantity if initialQuantity is provided', () => {
    render(<PreorderForm initialQuantity={10} />);
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(10);
  });


  test('updates form fields on user input', () => {
    render(<PreorderForm />);
    fillForm(); // Fills with 'Test Product' and quantity 2
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(2);
    expect(screen.getByLabelText(/street/i)).toHaveValue('123 Main St');
    // ... check other fields like city, postalCode, country, notes
  });

  test('shows validation errors for required fields on submit if empty', async () => {
    render(<PreorderForm />);
    // Clear product name as it might be pre-filled by default in some tests
    // Clear product name as it might be pre-filled by default in some tests if initialProductName is not explicitly empty
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: '' } });

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
    fillForm({ fillProductName: true, quantity: '0' }); // Fill other fields, set quantity to 0
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    await waitFor(() => {
      expect(screen.getByText('Quantity must be at least 1.')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('handles successful form submission and calls onPreorderSuccess', async () => {
    const mockSuccessData = { _id: 'preorder_123', message: 'Success!' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    });
    const mockOnSuccess = jest.fn();

    render(<PreorderForm onPreorderSuccess={mockOnSuccess} initialProductId="prod_test_id" />);
    // fillForm will use 'Test Product', quantity 2, etc.
    // initialProductId is passed above.
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/createPreorder', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expect.objectContaining({
          userId: mockUser.id,
          userName: mockUser.fullName,
          userEmail: mockUser.primaryEmailAddress.emailAddress,
          productName: 'Test Product', // From fillForm
          productId: 'prod_test_id', // From initial prop
          quantity: 2, // From fillForm
          shippingAddress: {
            street: '123 Main St', // From fillForm
            city: 'Testville', // From fillForm
            postalCode: '12345',
            country: 'Testland', // From fillForm
          },
          notes: 'Some notes here', // From fillForm
        })),
      }));
    });

    await waitFor(() => {
        expect(screen.getByText('Pre-order submitted successfully!')).toBeInTheDocument();
      });

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledWith(mockSuccessData);

    // Check if form is cleared (example: product name, quantity)
    // productName will be empty (as initialProductName was not set in this specific render)
    // productId will be 'prod_test_id' (as initialProductId was set)
    // quantity will be 1 (default initialQuantity if not specified otherwise in render)
    expect(screen.getByLabelText(/product name/i)).toHaveValue('');
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(1);
    expect(screen.getByLabelText(/street/i)).toHaveValue('');
  });

  test('handles successful form submission with initial values and resets correctly', async () => {
    const initialProduct = "Fixed Product";
    const initialId = "fixed_id_001";
    const initialQty = 3;
    const mockSuccessData = { _id: 'preorder_456', message: 'Success!' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => (mockSuccessData),
    });
    const mockOnSuccess = jest.fn();

    render(
        <PreorderForm
            initialProductName={initialProduct}
            initialProductId={initialId}
            initialQuantity={initialQty}
            onPreorderSuccess={mockOnSuccess}
        />
    );

    // User might change some fields but not product name (as it's disabled)
    // Let's say user changes quantity and adds notes
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/street/i), { target: { value: '456 New St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Newville' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '67890' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Newland' } });
    fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Urgent pre-order' } });

    fireEvent.click(screen.getByRole('button', { name: /submit pre-order/i }));

    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/createPreorder', expect.objectContaining({
        body: JSON.stringify(expect.objectContaining({
          productName: initialProduct, // Should use the initial product name
          productId: initialId,       // Should use the initial product ID
          quantity: 5,                // Updated quantity
        })),
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Pre-order submitted successfully!')).toBeInTheDocument();
    });
    expect(mockOnSuccess).toHaveBeenCalledWith(mockSuccessData);

    // Form should reset to its initial prop values
    expect(screen.getByLabelText(/product name/i)).toHaveValue(initialProduct);
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(initialQty); // Resets to initialQuantity prop
    expect(screen.getByLabelText(/street/i)).toHaveValue(''); // Other fields clear
  });


  test('handles failed form submission (API error)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API Error: Something went wrong' }),
    });

    render(<PreorderForm />);
    fillForm(); // Fills with "Test Product"
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
