import { Layout } from "../components";
import "../styles/globals.css";
import { StateContext } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
// import { ClerkProvider } from "@clerk/nextjs"; // Replaced by ClerkThemeProvider
import { ThemeProvider } from 'next-themes';
// import { dark } from "@clerk/themes"; // This is now handled in ClerkThemeProvider
import { ClerkThemeProvider } from '../components/ClerkThemeProvider';

export default function App({ Component, pageProps }) {
  // const clerkAppearance = { ... }; // This object is now defined and managed within ClerkThemeProvider

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkThemeProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        {...pageProps} // Spread pageProps to pass __clerk_ssr_state and other props
      >
        <StateContext>
          <Layout>
            <Toaster />
            <Component {...pageProps} />
          </Layout>
        </StateContext>
      </ClerkThemeProvider>
    </ThemeProvider>
  );
}
