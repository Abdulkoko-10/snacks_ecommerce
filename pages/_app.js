import { Layout } from '../components';
import '../styles/globals.css';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import ClerkThemeProvider from '../components/ClerkThemeProvider'; // Import the new provider

export default function App({ Component, pageProps }) {
  // All the previous useEffect, useState, and theme detection logic is now removed.
  // The conditional rendering (if !effectiveAppearance) is also removed.
  // ClerkThemeProvider handles its own client-side theme detection and rendering.

  return (
    <ClerkThemeProvider>
      <StateContext>
        <Layout>
          <Toaster />
          <Component {...pageProps} />
        </Layout>
      </StateContext>
    </ClerkThemeProvider>
  );
}
