import { Layout } from "../components";
import "../styles/globals.css";
import { StateContext } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
// import { dark } from "@clerk/themes"; // Import a base theme if you want to use one

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <StateContext>
        <Layout>
          <Toaster />
          <Component {...pageProps} />
        </Layout>
      </StateContext>
    </ClerkProvider>
  );
}
