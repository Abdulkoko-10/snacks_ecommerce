import { Layout } from '../components';
import '../styles/globals.css';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import ClerkThemeProvider from '../components/ClerkThemeProvider'; // Our custom Clerk provider
import { ThemeProvider } from 'next-themes'; // Import next-themes ThemeProvider

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkThemeProvider>
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
