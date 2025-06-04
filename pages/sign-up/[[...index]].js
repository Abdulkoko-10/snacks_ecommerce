import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
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
            card: {
              background: 'var(--glass-background-color)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)', // For Safari compatibility
              borderRadius: '10px', // This might need adjustment based on Clerk's actual card structure/variables
              border: '1px solid var(--glass-border-color)',
              boxShadow: '0 8px 32px 0 var(--glass-box-shadow-color)',
              padding: '30px' // Initial padding, may need review
            },
            rootBox: "mx-auto", // Center the component (if applicable, though centering is mainly by pageStyle)
          },
          variables: {
            colorPrimary: "var(--primary-color)",
            colorText: "var(--text-color)",
            colorInputBackground: "var(--secondary-background-color)", // Background for input fields
            colorInputText: "var(--text-color)", // Text within input fields
            // Potentially map other variables like colorDanger, colorSuccess if defined in globals.css
            // colorDanger: "var(--some-danger-color)",
            // colorSuccess: "var(--some-success-color)",
          },
        }}
      />
    </div>
  );
};

export default SignUpPage;
