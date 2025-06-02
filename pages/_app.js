import { ClerkProvider } from "@clerk/nextjs";
import { Layout } from "../components";
import "../styles/globals.css";
import { StateContext } from "../context/StateContext";
import { Toaster } from "react-hot-toast";

const appearance = {
  baseTheme: 'system', // Or 'light', 'dark' if you prefer a default
  variables: {
    colorPrimary: 'var(--primary-color)',
    colorBackground: 'var(--primary-background-color)',
    colorText: 'var(--text-color)',
    colorInputBackground: 'var(--secondary-background-color)',
    colorInputText: 'var(--text-color)',
    borderRadius: '0.5rem', // Example, adjust to match design
  },
  elements: {
    card: {
      backgroundColor: 'var(--glass-background-color)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--glass-border-color)',
      boxShadow: '0 8px 32px 0 var(--glass-box-shadow-color)',
    },
    modalContent: {
     backgroundColor: 'var(--glass-background-color)',
     backdropFilter: 'blur(10px)',
     border: '1px solid var(--glass-border-color)',
     boxShadow: '0 8px 32px 0 var(--glass-box-shadow-color)',
    },
    formButtonPrimary: {
     backgroundColor: 'var(--primary-color)',
     color: 'var(--text-on-primary-color)',
     '&:hover': {
       backgroundColor: 'var(--secondary-color)', // Example hover
     }
    }
  }
};

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider appearance={appearance} {...pageProps}>
      <StateContext>
        <Layout>
          <Toaster />
          <Component {...pageProps} />
        </Layout>
      </StateContext>
    </ClerkProvider>
  )
}
