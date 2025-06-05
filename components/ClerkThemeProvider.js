'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { dark, light } from '@clerk/themes';
import { clerkAppearance as customClerkAppearance } from '../lib/clerkAppearance'; // Adjust path if necessary

export default function ClerkThemeProvider({ children }) {
  const { resolvedTheme } = useTheme();

  // Determine the Clerk base theme based on the application's resolved theme
  // For our app's 'rgb' mode, we default to Clerk's 'light' base theme.
  const baseThemeForClerk = resolvedTheme === 'dark' ? dark : light;

  // Temporarily use only the base theme to test SignInButton functionality
  const mergedAppearance = {
    baseTheme: baseThemeForClerk,
    // Spreading customClerkAppearance is commented out for now
    // ...customClerkAppearance,
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={mergedAppearance}
    >
      {children}
    </ClerkProvider>
  );
}
