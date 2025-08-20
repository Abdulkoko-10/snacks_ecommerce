// __tests__/api/createPreOrder.test.js
import createPreOrderHandler from '../../pages/api/createPreOrder';
import { writeClient } from '../../lib/client';
import { sendPreOrderConfirmationEmail, sendAdminPreOrderNotificationEmail } from '../../lib/sendEmail';
import { getAuth, clerkClient } from '@clerk/nextjs/server';

jest.mock('../../lib/client', () => ({
  writeClient: {
    create: jest.fn(),
  },
}));
jest.mock('../../lib/sendEmail', () => ({
  sendPreOrderConfirmationEmail: jest.fn(),
  sendAdminPreOrderNotificationEmail: jest.fn(),
}));
jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

describe('/api/createPreOrder', () => {
  let req, res;
  const mockUser = {
      id: 'user_123',
      primaryEmailAddressId: 'email_123',
      emailAddresses: [{ id: 'email_123', emailAddress: 'test@example.com' }],
      firstName: 'Test'
    };


  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      method: 'POST',
      body: {
        cartItems: [{ _id: 'prod1', name: 'Test Product', price: 10, quantity: 1 }],
        totalPrice: 10,
        shippingAddress: {
          fullName: 'Test User',
          street: '123 Test St',
          city: 'Testville',
          postalCode: '12345',
          country: 'Testland'
        }
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    process.env.ADMIN_EMAIL_ADDRESS = 'admin@example.com';
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL_ADDRESS;
  });

  it('should return 405 if method is not POST', async () => {
    req.method = 'GET';
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith('Method Not Allowed');
  });

  it('should return 401 if user is not logged in', async () => {
    getAuth.mockReturnValue({ userId: null });
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not logged in or session not found.' });
  });

  it('should return 400 if cartItems are missing', async () => {
    getAuth.mockReturnValue({ userId: 'user_123' });
    clerkClient.users.getUser.mockResolvedValue(mockUser); // Mock clerk user to prevent 404
    delete req.body.cartItems; // More specific test
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid required pre-order data (cartItems, totalPrice, shippingAddress).' });
  });

  it('should create pre-order and send emails on success', async () => {
    const mockCreatedPreOrder = { _id: 'preorder_abc', ...req.body };

    getAuth.mockReturnValue({ userId: mockUser.id });
    clerkClient.users.getUser.mockResolvedValue(mockUser);
    writeClient.create.mockResolvedValue(mockCreatedPreOrder);
    sendPreOrderConfirmationEmail.mockResolvedValue(true);
    sendAdminPreOrderNotificationEmail.mockResolvedValue(true);

    await createPreOrderHandler(req, res);

    const expectedSanityCartItems = req.body.cartItems.map(item => ({
        _key: item._id,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
    }));

    expect(writeClient.create).toHaveBeenCalledWith(expect.objectContaining({
      _type: 'preOrder',
      userId: mockUser.id,
      userName: mockUser.emailAddresses[0].emailAddress, // API prioritizes email
      cartItems: expectedSanityCartItems, // API transforms cart items
      totalPrice: req.body.totalPrice,
      shippingAddress: req.body.shippingAddress,
      status: 'pending',
    }));

    expect(sendPreOrderConfirmationEmail).toHaveBeenCalledWith(mockUser.emailAddresses[0].emailAddress, mockUser.firstName, mockCreatedPreOrder);
    expect(sendAdminPreOrderNotificationEmail).toHaveBeenCalledWith(
      'admin@example.com',
      mockCreatedPreOrder,
      expect.objectContaining({ email: mockUser.emailAddresses[0].emailAddress })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pre-order created successfully', preOrder: mockCreatedPreOrder });
  });

  it('should handle Sanity client failure', async () => {
    getAuth.mockReturnValue({ userId: mockUser.id });
    clerkClient.users.getUser.mockResolvedValue(mockUser);
    const sanityError = new Error('Sanity error');
    writeClient.create.mockRejectedValue(sanityError);

    await createPreOrderHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to create pre-order in database.',
        details: sanityError.message
    }));
  });
});
