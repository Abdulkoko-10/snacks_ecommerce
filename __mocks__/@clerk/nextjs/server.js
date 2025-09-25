export const getAuth = jest.fn(() => ({
  userId: 'user_12345',
  sessionId: 'sess_12345',
  // Add any other properties your tests might need from the auth object
}));

export const clerkClient = {
  users: {
    getUser: jest.fn().mockResolvedValue({
      id: 'user_12345',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ email_address: 'test@example.com' }],
    }),
  },
};

// You can add other server-side exports here if your application uses them
// For example: currentUser, auth, etc.
export const auth = jest.fn(() => ({
  userId: 'user_12345',
  sessionId: 'sess_12345',
}));

export const currentUser = jest.fn().mockResolvedValue({
  id: 'user_12345',
  firstName: 'Test',
  lastName: 'User',
});