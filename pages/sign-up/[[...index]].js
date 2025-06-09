import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
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
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
            },
            cardBox: "glassmorphism", // Attempting to apply to cardBox
            card: "glassmorphism", // Keeping original as fallback or if cardBox is a wrapper
            rootBox: "mx-auto", // Center the component
            formInput: {
              borderColor: "var(--glass-border-color)",
              '&:focus': {
                borderColor: "var(--primary-color)",
                boxShadow: "0 0 0 1px var(--primary-color)",
              },
            },
          },
          variables: {
            colorPrimary: "var(--primary-color)",
            colorText: "var(--text-color)",
            colorBackground: "var(--primary-background-color)", // Background of the card/modal
            colorInputBackground: "var(--secondary-background-color)", // Background for input fields - kept opaque for readability
            colorInputText: "var(--text-color)", // Text within input fields
            colorDanger: "var(--primary-color)", // Using primary-color (red) for danger states
            colorSuccess: "var(--success-message-color)", // Using defined success color for success states
            // colorShimmer: uses primaryColor unless specified.
          },
        }}
      />
    </div>
  );
};

export default SignUpPage;
