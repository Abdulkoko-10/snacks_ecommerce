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
            card: "glassmorphism",
            formButtonPrimary: {
              backgroundColor: "var(--clr-btn-primary-bg)",
              color: "var(--clr-btn-primary-text)",
              fontSize: "0.875rem",
              textTransform: "normal-case",
              '&:hover': {
                backgroundColor: "var(--clr-btn-primary-hover-bg)",
              },
            },
          },
          variables: {
            colorPrimary: "var(--primary-color)",
            colorText: "var(--text-color)",
            colorBackground: "var(--primary-background-color)",
            colorInputBackground: "var(--secondary-background-color)",
            colorInputText: "var(--text-color)",
          },
        }}
      />
    </div>
  );
};

export default SignUpPage;
