import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  // --navbar-height is defined in globals.css, default to 70px if not found
  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - var(--navbar-height, 70px))', // Adjust 70px if your navbar height variable is different or not set
    padding: '20px',
    boxSizing: 'border-box', // Ensures padding doesn't add to height causing overflow with 100vh
  };

  return (
    <div style={pageStyle}>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary: {
              backgroundColor: "var(--clr-btn-primary-bg)",
              color: "var(--clr-btn-primary-text)",
              fontSize: "0.875rem", // text-sm
              textTransform: "normal-case",
              '&:hover': {
                backgroundColor: "var(--clr-btn-primary-hover-bg)",
              },
              '&:focus': {
                outline: '2px solid var(--primary-color)',
                outlineOffset: '2px',
                backgroundColor: "var(--clr-btn-primary-hover-bg)", // Optional: darken on focus too
              },
            },
            formFieldInput: {
              borderColor: 'var(--glass-border-color)', // Use a subtle border color
              color: 'var(--text-color)', // Ensure input text color is themed
              backgroundColor: 'var(--secondary-background-color)', // Ensure input background is themed
              '&:focus': {
                borderColor: 'var(--primary-color)',
                boxShadow: '0 0 0 1px var(--primary-color)', // Standard focus shadow for inputs
              },
            },
            socialButtonsBlockButton: {
              borderColor: 'var(--glass-border-color)',
              color: 'var(--text-color)',
              backgroundColor: 'transparent', // Ensure it's not inheriting a weird background
              '&:hover': {
                backgroundColor: 'var(--secondary-background-color)',
              },
              '&:focus': {
                outline: '2px solid var(--primary-color)',
                outlineOffset: '2px',
                backgroundColor: 'var(--secondary-background-color)', // Optional: subtle bg change on focus
              },
            },
            footerActionLink: {
              color: 'var(--primary-color)', // Already set by variables.colorPrimary, but explicit
              fontWeight: '600', // Example: make it slightly bolder
              '&:hover': {
                color: 'var(--primary-color-hover, var(--primary-color))',
                textDecoration: 'underline',
              },
              '&:focus': {
                outline: '2px solid var(--primary-color)',
                outlineOffset: '2px',
                textDecoration: 'underline', // Keep underline on focus for links
              },
            },
            dividerText: {
              color: 'var(--secondary-color)',
            },
            formHeaderTitle: {
              color: 'var(--text-color)',
            },
            formHeaderSubtitle: {
              color: 'var(--secondary-color)', // Subtitles can be secondary
            },
            formFieldLabel: {
              color: 'var(--text-color)',
            },
            formFieldErrorText: {
              color: 'var(--error-color, var(--primary-color))', // Use new error color
            },
            formButtonSecondary: {
              backgroundColor: 'transparent',
              color: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              borderWidth: '1px',
              '&:hover': {
                backgroundColor: 'rgba(var(--primary-color-rgb, 240, 45, 52), 0.1)', // Use primary-color-rgb for alpha, fallback to default red
                color: 'var(--primary-color-hover, var(--primary-color))',
              },
              '&:focus': {
                outline: '2px solid var(--primary-color)',
                outlineOffset: '2px',
                borderColor: 'var(--primary-color-hover, var(--primary-color))',
              },
            },
            formFieldInputCheckbox: {
              accentColor: 'var(--primary-color)',
              borderColor: 'var(--primary-color)', // Border for the checkbox itself
              '&:focus': {
                outline: '2px solid var(--primary-color)', // Focus outline around the checkbox
                outlineOffset: '1px',
              },
            },
            formFieldInputRadio: { // Often inherits from checkbox, but can be explicit
              accentColor: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              '&:focus': {
                outline: '2px solid var(--primary-color)',
                outlineOffset: '1px',
              },
            },
            card: "glassmorphism", // Apply glassmorphism to the card
            rootBox: "mx-auto", // Center the component
          },
          variables: {
            colorPrimary: "var(--primary-color)",
            colorText: "var(--text-color)", // Default text color for most text elements
            colorTextSecondary: "var(--secondary-color)",
            // colorBackground: "var(--primary-background-color)", // Let glassmorphism class handle this
            colorInputBackground: "var(--secondary-background-color)", // Background for input fields
            colorInputText: "var(--text-color)", // Text within input fields
            colorShimmer: "var(--primary-color)",
            colorDanger: "var(--error-color, var(--primary-color))", // DEPRECATED by colorError but good to have a fallback
            colorError: "var(--error-color, var(--primary-color))", // New standard error variable
            colorSuccess: "var(--success-message-color)",
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
