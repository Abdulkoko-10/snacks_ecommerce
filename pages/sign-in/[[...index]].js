import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  // --navbar-height is defined in globals.css, default to 70px if not found
  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - var(--navbar-height, 70px))', // Adjust 70px if your navbar height variable is different or not set
    padding: '60px 20px 20px 20px',
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
            },
            card: {
              background: 'var(--glass-background-color) !important',
              backdropFilter: 'blur(10px) !important',
              WebkitBackdropFilter: 'blur(10px) !important', // For Safari compatibility
              borderRadius: '10px !important', // This might need adjustment based on Clerk's actual card structure/variables
              border: '1px solid var(--glass-border-color) !important',
              boxShadow: '0 8px 32px 0 var(--glass-box-shadow-color) !important',
              padding: '30px !important' // Initial padding, may need review
            },
            rootBox: "mx-auto", // Center the component
          },
          variables: {
            colorPrimary: "var(--primary-color)",
            colorText: "var(--text-color)",
            colorInputBackground: "var(--secondary-background-color)", // Background for input fields
            colorInputText: "var(--text-color)", // Text within input fields
            // colorShimmer: uses primaryColor unless specified.
            // colorDanger: typically red, can be var(--primary-color) if it's red, or a specific error color.
            // colorSuccess: typically green, can be var(--success-message-color) or similar.
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
