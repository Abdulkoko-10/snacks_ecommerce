import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "../../lib/clerkAppearance";

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
        appearance={clerkAppearance}
      />
    </div>
  );
};

export default SignInPage;
