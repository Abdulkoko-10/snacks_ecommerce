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
            },
            card: "glassmorphism", // Apply glassmorphism to the card
            rootBox: "mx-auto", // Center the component
          },
          variables: {
            colorPrimary: "var(--clr-primary)",
            colorText: "var(--clr-text-primary)",
            colorBackground: "var(--clr-background)",
            colorInputBackground: "var(--clr-input-background)",
            colorInputText: "var(--clr-input-text)",
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
