import React from 'react';

// Mock the ClerkProvider to just render its children
export const ClerkProvider = ({ children }) => <>{children}</>;

// Mock UserButton
export const UserButton = () => <div data-testid="user-button-mock"></div>;

// Mock SignedIn and SignedOut to conditionally render children
// By default, we'll simulate a signed-in state.
export const SignedIn = ({ children }) => <>{children}</>;
export const SignedOut = ({ children }) => null; // Render nothing for SignedOut by default

// Mock useUser hook
export const useUser = () => ({
  isSignedIn: true,
  user: {
    id: 'user_12345',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: '/test-user-image.png',
  },
});

// Mock useAuth hook
export const useAuth = () => ({
  isLoaded: true,
  isSignedIn: true,
  userId: 'user_12345',
  sessionId: 'sess_12345',
  getToken: async () => 'test_jwt_token',
});

// Mock other components you might be using, like SignIn, SignUp, etc.
export const SignIn = () => <div data-testid="sign-in-mock"></div>;
export const SignUp = () => <div data-testid="sign-up-mock"></div>;
export const SignInButton = ({ children }) => <button>{children}</button>;