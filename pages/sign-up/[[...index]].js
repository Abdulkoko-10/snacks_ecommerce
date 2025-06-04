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
            card: "glassmorphism", // Apply glassmorphism to the card
            rootBox: "mx-auto", // Center the component (if applicable, though centering is mainly by pageStyle)
          },
          variables: {
            colorPrimary: "var(--primary-color)",
            colorText: "var(--text-color)",
            colorBackground: "var(--primary-background-color)", // Background of the card/modal
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
