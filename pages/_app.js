import { useEffect, useState } from 'react';
import { Layout } from '../components';
import '../styles/globals.css';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';
import { dark, light } from '@clerk/themes'; // Import Clerk base themes
import { clerkAppearance as customClerkAppearance } from '../lib/clerkAppearance'; // Our custom styles

export default function App({ Component, pageProps }) {
  // Initialize with null, so ClerkProvider isn't rendered with a potentially incorrect theme initially
  const [effectiveAppearance, setEffectiveAppearance] = useState(null);

  useEffect(() => {
    const updateClerkAppearanceConfig = () => {
      let currentAppTheme = 'light'; // Default
      // Ensure this code runs only on the client side
      if (typeof window !== 'undefined') {
        currentAppTheme = localStorage.getItem('themeMode') ||
                          (document.documentElement.classList.contains('dark-mode') ? 'dark' :
                           (document.documentElement.classList.contains('rgb-mode') ? 'rgb' : 'light'));
      }

      const baseThemeForClerk = currentAppTheme === 'dark' ? dark : light;

      setEffectiveAppearance({
        ...customClerkAppearance, // Our custom elements and variables
        baseTheme: baseThemeForClerk,   // Dynamically set Clerk base theme
      });
    };

    updateClerkAppearanceConfig(); // Determine and set the appearance config

    // Observer for class changes on documentElement (theme switches)
    const observer = new MutationObserver(updateClerkAppearanceConfig);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    // Listener for storage events (theme changes in other tabs)
    window.addEventListener('storage', updateClerkAppearanceConfig);

    return () => {
      if (typeof window !== 'undefined') {
        observer.disconnect();
      }
      window.removeEventListener('storage', updateClerkAppearanceConfig);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // If effectiveAppearance is not yet determined, return null or a loading indicator
  // This prevents ClerkProvider from rendering with a default/potentially incorrect theme before client-side detection
  if (!effectiveAppearance) {
    // Render a minimal layout or loader if desired, instead of null
    // For now, returning null to test the core logic.
    // Consider a basic Layout shell if null causes issues with Next.js hydration.
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={effectiveAppearance} // Apply the determined appearance
    >
      <StateContext>
        <Layout>
          <Toaster />
          <Component {...pageProps} />
        </Layout>
      </StateContext>
    </ClerkProvider>
  );
}
