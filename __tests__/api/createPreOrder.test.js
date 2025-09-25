// __tests__/api/createPreOrder.test.js
import createPreOrderHandler from '../../pages/api/createPreOrder'; // Adjust path
import { writeClient } from '../../lib/client'; // Mock this
import { sendPreOrderConfirmationEmail, sendAdminPreOrderNotificationEmail } from '../../lib/sendEmail'; // Mock this
import { currentUser } from '@clerk/nextjs/server'; // Mock this

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
  currentUser: jest.fn(),
}));

describe.skip('/api/createPreOrder', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      method: 'POST',
      body: {
        cartItems: [{ _id: 'prod1', name: 'Test Product', price: 10, quantity: 1 }],
        totalPrice: 10,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    // Ensure SANITY_API_WRITE_TOKEN is perceived as set for the writeClient check in API
    // For the purpose of this test, the mock directly replaces writeClient.
    // If testing the null check for writeClient, a different mock setup would be needed.
    // process.env.SANITY_API_WRITE_TOKEN = "dummytoken";
    process.env.ADMIN_EMAIL_ADDRESS = 'admin@example.com';
  });

  afterEach(() => {
    // delete process.env.SANITY_API_WRITE_TOKEN;
    delete process.env.ADMIN_EMAIL_ADDRESS;
  });

  it('should return 405 if method is not POST', async () => {
    req.method = 'GET';
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith('Method Not Allowed');
  });

  it('should return 401 if user is not logged in', async () => {
    currentUser.mockResolvedValue(null);
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not logged in.' });
  });

  it('should return 400 if cartItems or totalPrice are missing', async () => {
    currentUser.mockResolvedValue({ id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] });
    req.body = {};
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required pre-order data.' });
  });

  it('should create pre-order and send emails on success', async () => {
    const mockUser = { id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }], firstName: 'Test' };
    const mockCreatedPreOrder = { _id: 'preorder_abc', ...req.body };
    currentUser.mockResolvedValue(mockUser);
    writeClient.create.mockResolvedValue(mockCreatedPreOrder);
    sendPreOrderConfirmationEmail.mockResolvedValue(true);
    sendAdminPreOrderNotificationEmail.mockResolvedValue(true);

    await createPreOrderHandler(req, res);

    expect(writeClient.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUser.id,
      userName: mockUser.firstName,
      cartItems: expect.any(Array),
      totalPrice: req.body.totalPrice,
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
    currentUser.mockResolvedValue({ id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] });
    writeClient.create.mockRejectedValue(new Error('Sanity error'));
    await createPreOrderHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to create pre-order.' }));
  });
});
