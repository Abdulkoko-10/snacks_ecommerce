export const clerkAppearance = {
  elements: {
    formButtonPrimary: {
      backgroundColor: "var(--clr-btn-primary-bg)",
      color: "var(--clr-btn-primary-text)",
      fontSize: "0.875rem", // text-sm
      textTransform: "normal-case",
      '&:hover': {
        backgroundColor: "var(--clr-btn-primary-hover-bg)",
      },
    },
    card: "glassmorphism",
    rootBox: "mx-auto", // Center the component
  },
  variables: {
    colorPrimary: "var(--primary-color)",
    colorText: "var(--text-color)",
    colorBackground: "var(--primary-background-color)",
    colorInputBackground: "var(--secondary-background-color)",
    colorInputText: "var(--text-color)",
    // TODO: Add other variables as needed, like colorDanger, colorSuccess, etc.
  },
};
