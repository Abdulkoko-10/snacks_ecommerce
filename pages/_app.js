import { Layout } from "../components";
import "../styles/globals.css";
import { StateContext } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"; // Import a base theme if you want to use one

export default function App({ Component, pageProps }) {
  const clerkAppearance = {
    baseTheme: undefined, // Can be `dark` or light (default) or undefined to use system preference
    variables: {
      // General
      colorPrimary: "var(--primary-color)",
      colorBackground: "var(--primary-background-color)",
      colorText: "var(--text-color)",
      colorInputBackground: "var(--secondary-background-color)",
      colorInputText: "var(--text-color)",

      // Cards & Modals (using glassmorphism variables)
      colorBackgroundMuted: "var(--glass-background-color)", // For card backgrounds
      colorNeutralMuted: "var(--glass-background-color)", // for modal backdrop
      colorNeutral: "var(--glass-border-color)", // for borders

      // Buttons
      colorDanger: "var(--primary-color)", // Example for destructive actions
      colorSuccess: "var(--plus-color)", // Example for success actions

      // Specific Clerk component elements
      // You might need to inspect Clerk components to find the exact variables they use if not covered by globals
    },
    elements: {
      card: { // This is the main container for the sign-in/up form
        backgroundColor: "var(--glass-background-color)", // Should be translucent
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "var(--glass-border-color)",
        boxShadow: "0 8px 32px 0 var(--glass-box-shadow-color)",
        borderRadius: "10px", // Consistent with .glassmorphism class
        // Consider if padding is needed here or if Clerk handles it internally
      },
      modalContent: { // modalContent often wraps the card
        backgroundColor: "transparent", // Make it transparent if card is already glassmorphism
        boxShadow: "none", // Let the card handle shadow
      },
      modalBackdrop: "rgba(0, 0, 0, 0.5)", // Standard semi-transparent dark backdrop
      formButtonPrimary: {
        backgroundColor: "var(--primary-color)",
        color: "var(--text-on-primary-color)", // Assuming you have this for text on primary buttons
        '&:hover': {
          backgroundColor: "var(--secondary-color)", // Example: darken on hover
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
      headerTitle: {
        color: "var(--text-color)",
      },
      headerSubtitle: {
        color: "var(--text-color)",
      },
      bodyText: {
        color: "var(--text-color)",
      },
      footerActionText: {
        color: "var(--text-color)",
      },
      footerActionLink: {
        color: "var(--primary-color)",
        '&:hover': {
          color: "var(--secondary-color)", // Example: darken on hover
        }
      },
      dividerLine: {
        backgroundColor: "var(--glass-border-color)",
      },
      dividerText: {
        color: "var(--text-color)",
      },
      formFieldLabel: {
        color: "var(--text-color)",
      },
      socialButtonsBlockButton: { // For "Continue with X"
        borderColor: "var(--glass-border-color)",
        '&:hover': {
          backgroundColor: "var(--secondary-background-color)",
        }
      },
      socialButtonsProviderIcon: {
        // color: "var(--text-color)" // if you want to theme the provider icons
      },
      selectButton: {
        borderColor: "var(--glass-border-color)",
        '&:hover': {
          backgroundColor: "var(--secondary-background-color)",
        }
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
      // appearance={clerkAppearance}
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
