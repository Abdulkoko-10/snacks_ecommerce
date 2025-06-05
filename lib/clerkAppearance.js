export const clerkAppearance = {
  elements: {
    formButtonPrimary: {
      backgroundColor: "var(--clr-btn-primary-bg)",
      color: "var(--clr-btn-primary-text)",
      fontSize: "0.875rem",
      textTransform: "normal-case",
      '&:hover': {
        backgroundColor: "var(--clr-btn-primary-hover-bg)",
      },
    },
    card: "glassmorphism", // This class uses CSS variables for its background, border, shadow
    rootBox: "mx-auto",    // Utility class for centering
  },
  variables: {
    colorPrimary: "var(--primary-color)", // Ensures Clerk actions use the app's primary color.
    // Removed other general color variables (colorText, colorBackground, etc.)
    // to better leverage Clerk's native light/dark base themes.
    // The 'glassmorphism' class on 'card' will handle its own background.
    // Specific overrides can be added back if base themes are insufficient.
  },
};
