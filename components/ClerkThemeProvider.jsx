"use client";

import React, { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

// This is the clerkAppearance object copied from pages/_app.js
const baseClerkAppearance = {
  baseTheme: undefined,
  variables: {
    // General
    colorPrimary: "var(--primary-color)",
    colorBackground: "var(--primary-background-color)",
    colorText: "var(--text-color)",
    colorInputBackground: "var(--secondary-background-color)",
    colorInputText: "var(--text-color)",
    // Cards & Modals
    colorBackgroundMuted: "var(--glass-background-color)",
    colorNeutralMuted: "var(--glass-background-color)",
    colorNeutral: "var(--glass-border-color)",
    // Buttons
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

export function ClerkThemeProvider({ children, ...props }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Start with the base appearance
  let dynamicClerkAppearance = { ...baseClerkAppearance };

  if (mounted) {
    dynamicClerkAppearance.baseTheme = resolvedTheme === 'dark' ? dark : undefined;
  } else {
    // While not mounted, we might want to ensure baseTheme is explicitly undefined
    // or set to a default that doesn't rely on client-side resolution yet.
    // The current baseClerkAppearance already has baseTheme: undefined, so this is fine.
  }

  // If props contains a specific appearance object from _app.js (it shouldn't anymore with this pattern),
  // this might need more nuanced merging. However, the goal is for this component to *be* the source of truth for appearance.
  // The publishableKey and other direct ClerkProvider props will be passed via ...props.

  return (
    <ClerkProvider {...props} appearance={mounted ? dynamicClerkAppearance : baseClerkAppearance}>
      {children}
    </ClerkProvider>
  );
}
