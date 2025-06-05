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

  // Merge our custom appearance settings with the determined Clerk base theme
  const mergedAppearance = {
    ...customClerkAppearance, // Our custom elements (e.g., card) and variables
    baseTheme: baseThemeForClerk,
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
