import { useEffect, useState } from 'react';
import { Layout } from '../components';
import '../styles/globals.css';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';
import { dark, light } from '@clerk/themes'; // Import Clerk base themes
import { clerkAppearance as customClerkAppearance } from '../lib/clerkAppearance'; // Our custom styles

export default function App({ Component, pageProps }) {
  const [clerkTheme, setClerkTheme] = useState(light); // Default to Clerk's light theme

  useEffect(() => {
    // Function to update Clerk theme based on document class or localStorage
    const updateClerkTheme = () => {
      let currentAppTheme = 'light'; // Default
      if (typeof window !== 'undefined') {
        currentAppTheme = localStorage.getItem('themeMode') ||
                          (document.documentElement.classList.contains('dark-mode') ? 'dark' :
                           (document.documentElement.classList.contains('rgb-mode') ? 'rgb' : 'light'));
      }

      if (currentAppTheme === 'dark') {
        setClerkTheme(dark);
      } else {
        // For both 'light' and 'rgb' modes of our app, use Clerk's light base theme
        setClerkTheme(light);
      }
    };

    updateClerkTheme(); // Set initial theme

    // Observe changes to documentElement's class attribute
    // This is important if theme changes can happen after initial load without a page reload.
    const observer = new MutationObserver(updateClerkTheme);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    // Also listen for custom theme change events if Navbar dispatches any, or storage events
    window.addEventListener('storage', updateClerkTheme); // If theme is changed in another tab

    return () => {
      if (typeof window !== 'undefined') {
        observer.disconnect();
      }
      window.removeEventListener('storage', updateClerkTheme);
    };
  }, []);

  // Merge Clerk base theme with our custom appearance settings
  const mergedAppearance = {
    ...customClerkAppearance, // Our custom elements and variables
    baseTheme: clerkTheme,   // Dynamically set Clerk base theme
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={mergedAppearance} // Apply the merged appearance
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
