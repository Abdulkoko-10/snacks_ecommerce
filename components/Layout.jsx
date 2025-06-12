import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ( { children } ) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="layout">
      <Head>
        <title>Snacks</title>
      </Head>
      <header>
        {isClient && document.getElementById('navbar-portal-root') ?
          ReactDOM.createPortal(<Navbar />, document.getElementById('navbar-portal-root')) :
          null /* Or a placeholder if needed to prevent layout shift, but padding-top on .layout should handle this */
        }
      </header>
      <main className="main-container">
       {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default Layout