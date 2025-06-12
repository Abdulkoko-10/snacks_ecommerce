// lib/clerkAppearance.js
export const userProfileOnlyAppearance = {
  elements: {
    card: {
      backgroundColor: "var(--glass-background-color)",
      borderColor: "var(--glass-border-color)",
      boxShadow: "inset 0 1px 1px 0 var(--glass-inner-highlight-color), inset 0 -1px 1px 0 var(--glass-inner-shadow-color), 0 10px 35px -5px var(--glass-box-shadow-color)",
      borderRadius: "12px",
    }
  },
  variables: {
    // colorText: "var(--text-color)", // Example
  }
};

// You can also keep the original clerkAppearance here if you plan to use it later,
// or for reference, but ensure it's also exported if needed.
// export const fullClerkAppearance = { ... };
