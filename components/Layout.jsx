import React from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'
import { useEffect } from 'react';
import { observeUserProfileModal } from '../lib/clerkStyleOverrides'; // Adjust path as needed

const Layout = ( { children } ) => {
  useEffect(() => {
    observeUserProfileModal();
    // Optional: If you need to disconnect the observer when the Layout unmounts (e.g. in a SPA context where Layout itself might unmount)
    // return () => {
    //   stopObservingUserProfileModal();
    // };
  }, []);

  return (
    <div className="layout">
      <Head>
        <title>Snacks</title>
      </Head>
      <header>
        <Navbar />
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