// lib/clerkCustomAppearances.js
export const userProfileDedicatedAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "var(--primary-color)",
    colorText: "var(--text-color)",
    colorInputBackground: "var(--secondary-background-color)",
    colorInputText: "var(--text-color)",
    colorBackgroundMuted: "var(--glass-background-color)", // Used for card background if not overridden by elements.card.backgroundColor
    colorNeutral: "var(--glass-border-color)",      // Used for borders
    colorDanger: "var(--primary-color)", // Placeholder, ideally var(--danger-color)
    colorSuccess: "var(--plus-color)",
    // UserProfile specific variables might be needed if the defaults are not suitable
    // For example, if the UserProfile modal background itself (not the card) needs to be transparent
    // colorBackground: "transparent", // This could be risky if it makes text unreadable before card renders
  },
  elements: {
    card: { // Targets the main content block within UserProfile
      backgroundColor: "var(--glass-background-color)",
      borderColor: "var(--glass-border-color)",
      boxShadow: "inset 0 1px 1px 0 var(--glass-inner-highlight-color), inset 0 -1px 1px 0 var(--glass-inner-shadow-color), 0 10px 35px -5px var(--glass-box-shadow-color)",
      borderRadius: "12px",
    },
    modalContent: { // Wrapper around the card, ensure it's transparent
      backgroundColor: "transparent",
      padding: 0, // Remove any default padding that might make it look like a non-glass box
    },
    headerTitle: { // For titles like "Profile", "Security"
      color: "var(--text-color)",
    },
    formButtonPrimary: { // For buttons like "Save changes"
      backgroundColor: "var(--primary-color)",
      color: "var(--text-on-primary-color)",
      '&:hover': {
        backgroundColor: "var(--secondary-color)",
      },
    },
    formFieldInput: { // For input fields
      backgroundColor: "var(--secondary-background-color)",
      color: "var(--text-color)",
      borderColor: "var(--glass-border-color)",
      '&:focus': {
        borderColor: "var(--primary-color)",
        boxShadow: "0 0 0 1px var(--primary-color)",
      }
    },
    formFieldLabel: { // For labels of input fields
      color: "var(--text-color)",
    },
    bodyText: { // General text content
      color: "var(--text-color)",
    },
    dividerLine: { // Dividers between sections
      backgroundColor: "var(--glass-border-color)",
    },
    // For tab navigation within UserProfile (e.g., Profile, Security)
    // These are guesses based on common Clerk class names seen in CSS.
    // Actual keys might differ.
    // 'navbarButton': {
    //   color: "var(--text-color)",
    //   '&:hover': {
    //      backgroundColor: "var(--secondary-background-color)",
    //    }
    // },
    // 'navbarButton__active': {
    //   color: "var(--primary-color)", // Or accent color
    //   boxShadow: "inset 0 -2px 0 0 var(--primary-color)", // Example active indicator
    // },
    // 'profileSidebarNavigationButton': { // From CSS overrides
    //    color: "var(--text-color)",
    // },
    // 'profileSidebarNavigationButton__active': { // From CSS overrides
    //    color: "var(--accent-color)",
    //    backgroundColor: "var(--glass-inner-shadow-color)", // Subtle active background
    // }
  }
};
