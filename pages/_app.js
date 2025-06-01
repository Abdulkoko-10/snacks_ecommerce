import { Layout } from "../components";
import "../styles/globals.css";
import { StateContext, useStateContext } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

// TODO: Remember to set these environment variables in .env.local:
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// CLERK_SECRET_KEY

const ClerkThemedProvider = ({ children }) => {
  const { themeMode, rgbColor, mainContrastColor, applyRgbThemeLogic } = useStateContext();

  const glassmorphismStyles = {
    background: 'var(--glass-background-color)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--glass-border-color)',
    boxShadow: '0 8px 32px 0 var(--glass-box-shadow-color)',
    borderRadius: '10px', // Standardized border radius for glassmorphic elements
  };

  let clerkAppearance = {
    baseTheme: undefined, // Will be set for dark mode
    variables: {
      fontFamily: 'Open Sans, sans-serif', // Site-wide font
      borderRadius: '8px', // General border radius for non-card elements
      // Theme-specific variables will be populated below
    },
    elements: {
      cardBox: { // Main modal/dialog container for Clerk (e.g., sign-in modal)
        ...glassmorphismStyles,
      },
      userButtonPopoverCard: { // Popover for the user button
        ...glassmorphismStyles,
      },
      buttonPrimary: {
        borderRadius: '8px', // Consistent button border radius
        // backgroundColor and color will be set by theme variables
      },
      buttonNeutral: {
        borderRadius: '8px',
      },
      inputField: {
        borderRadius: '8px',
        // backgroundColor, color, borderColor will be set by theme variables
        '&:focus': { // Example of focus style, Clerk might have specific props for this
          borderColor: 'var(--primary-color)', // Use site's primary color for focus indication
          boxShadow: `0 0 0 1px var(--primary-color)`, // Mimic focus ring
        },
      },
      // You can add more targeted elements here if needed
      // e.g., formFieldLabel: { color: 'var(--text-color)' }
    }
  };

  if (themeMode === 'dark') {
    clerkAppearance.baseTheme = dark;
    clerkAppearance.variables = {
      ...clerkAppearance.variables,
      colorPrimary: 'var(--primary-color)', // Use site's primary color
      colorTextOnPrimaryBackground: 'var(--text-on-primary-color)', // Ensure text on primary buttons is correct
      // Other dark theme variables will be inherited from `dark` base theme
      // Override if needed:
      // colorBackground: 'var(--background-color-dark)',
      // colorInputBackground: 'var(--secondary-background-color-dark)',
      // colorInputText: 'var(--text-color-dark)',
    };
  } else if (themeMode === 'rgb') {
    const rgbThemeVars = applyRgbThemeLogic(rgbColor); // Expected to return { colorPrimary, colorText, colorBackground, colorInputBackground, colorInputText, colorTextOnPrimary (or similar for button text) }
    clerkAppearance.variables = {
      ...clerkAppearance.variables,
      ...rgbThemeVars, // Spread the RGB theme variables
      // Ensure colorTextOnPrimaryBackground is correctly mapped if applyRgbThemeLogic provides it differently
      // For example, if applyRgbThemeLogic returns `mainContrastColor` for text on primary elements:
      colorTextOnPrimaryBackground: rgbThemeVars.colorTextOnPrimary || mainContrastColor, // Fallback to mainContrastColor if specific not provided
    };
     // Clerk's default `light` theme might be a better base than `dark` if mainContrastColor is black.
     // Or no base theme to rely fully on variables.
     // if (mainContrastColor === '#000000') clerkAppearance.baseTheme = light; else clerkAppearance.baseTheme = dark;
     // For now, no base theme for RGB, relying on comprehensive variables.
  } else { // Light mode
    // clerkAppearance.baseTheme = light; // If Clerk provides a light base theme and it's preferred
    clerkAppearance.variables = {
      ...clerkAppearance.variables,
      colorPrimary: 'var(--primary-color)',
      colorText: 'var(--text-color-light)', // or 'var(--text-color)' if it adapts
      colorBackground: 'var(--primary-background-color)', // Or a specific background for Clerk UI
      colorInputBackground: 'var(--secondary-background-color)', // Typically inputs are on a slightly different bg
      colorInputText: 'var(--text-color-light)', // or 'var(--text-color)'
      colorTextOnPrimaryBackground: 'var(--text-on-primary-color)',
    };
  }
  // Apply common input styles across themes if not fully covered by variables
  clerkAppearance.elements.inputField = {
    ...clerkAppearance.elements.inputField, // Keep existing focus, borderRadius
    backgroundColor: clerkAppearance.variables.colorInputBackground || 'var(--secondary-background-color)',
    color: clerkAppearance.variables.colorInputText || 'var(--text-color)',
    borderColor: clerkAppearance.variables.colorBorder || 'var(--glass-border-color)', // Use a general border color or glass
  };
   clerkAppearance.elements.buttonPrimary = {
    ...clerkAppearance.elements.buttonPrimary,
    backgroundColor: clerkAppearance.variables.colorPrimary,
    color: clerkAppearance.variables.colorTextOnPrimaryBackground,
  };


  return (
    <ClerkProvider
      appearance={clerkAppearance}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
};

export default function App({ Component, pageProps }) {
  return (
    <StateContext>
      <ClerkThemedProvider>
        <Layout>
          <Toaster />
          <Component {...pageProps} />
        </Layout>
      </ClerkThemedProvider>
    </StateContext>
  );
}
