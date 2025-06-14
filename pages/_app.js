import { Layout } from "../components";
import "../styles/globals.css";
import { StateContext } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
// import { dark } from "@clerk/themes"; // Import a base theme if you want to use one - commented out as it's not used in clerkAppearance

// MUI and Emotion imports for SSR
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from '../lib/createEmotionCache';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// A simple default theme for MUI components
// You can customize this further or move it to a separate file
const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#556cd6', // Example primary color
    },
    secondary: {
      main: '#19857b', // Example secondary color
    },
    // You might want to sync this with your CSS variables if possible,
    // or define a theme that reflects your app's color scheme.
  },
  // You can also add typography, breakpoints, etc.
});

export default function App(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  // Clerk appearance object (copied from original _app.js)
  // Consider moving this to a separate file if it grows large
  const clerkAppearance = {
    baseTheme: undefined,
    variables: {
      colorPrimary: "var(--primary-color)",
      colorBackground: "var(--primary-background-color)",
      colorText: "var(--text-color)",
      colorInputBackground: "var(--secondary-background-color)",
      colorInputText: "var(--text-color)",
      colorBackgroundMuted: "var(--glass-background-color)",
      colorNeutralMuted: "var(--glass-background-color)",
      colorNeutral: "var(--glass-border-color)",
      colorDanger: "var(--primary-color)",
      colorSuccess: "var(--plus-color)",
    },
    elements: {
      card: {
        backgroundColor: "var(--glass-background-color)",
        borderColor: "var(--glass-border-color)",
        boxShadow: "0 8px 32px 0 var(--glass-box-shadow-color)",
        borderRadius: "10px",
      },
      modalContent: {
        backgroundColor: "transparent",
      },
      modalBackdrop: "rgba(0, 0, 0, 0.5)",
      formButtonPrimary: {
        backgroundColor: "var(--primary-color)",
        color: "var(--text-on-primary-color)",
        '&:hover': {
          backgroundColor: "var(--secondary-color)",
        },
      },
      formFieldInput: {
        backgroundColor: "var(--secondary-background-color)",
        color: "var(--text-color)",
        borderColor: "var(--glass-border-color)",
        '&:focus': {
          borderColor: "var(--primary-color)",
          boxShadow: "0 0 0 1px var(--primary-color)",
        }
      },
      headerTitle: { color: "var(--text-color)" },
      headerSubtitle: { color: "var(--text-color)" },
      bodyText: { color: "var(--text-color)" },
      footerActionText: { color: "var(--text-color)" },
      footerActionLink: {
        color: "var(--primary-color)",
        '&:hover': { color: "var(--secondary-color)" }
      },
      dividerLine: { backgroundColor: "var(--glass-border-color)" },
      dividerText: { color: "var(--text-color)" },
      formFieldLabel: { color: "var(--text-color)" },
      socialButtonsBlockButton: {
        borderColor: "var(--glass-border-color)",
        '&:hover': { backgroundColor: "var(--secondary-background-color)" }
      },
      selectButton: {
        borderColor: "var(--glass-border-color)",
        '&:hover': { backgroundColor: "var(--secondary-background-color)" }
      },
      selectOptionsContainer: {
        backgroundColor: "var(--secondary-background-color)",
        borderColor: "var(--glass-border-color)",
      },
      selectOption__selected: {
        backgroundColor: "var(--primary-color)",
        color: "var(--text-on-primary-color)",
      },
      selectOption: {
        '&:hover': {
          backgroundColor: "var(--primary-color)",
          color: "var(--text-on-primary-color)",
        }
      },
      badge: {
        backgroundColor: "var(--secondary-background-color)",
        color: "var(--text-color)",
        borderColor: "var(--glass-border-color)",
      }
    }
  };

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      // appearance={clerkAppearance} // Appearance is defined but not passed, uncomment if needed
    >
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={defaultTheme}>
          {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <StateContext>
            <Layout>
              <Toaster />
              <Component {...pageProps} />
            </Layout>
          </StateContext>
        </ThemeProvider>
      </CacheProvider>
    </ClerkProvider>
  );
}
