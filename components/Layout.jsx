import React, { useRef } from 'react'; // Added useRef
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ( { children } ) => {
  const contentRef = useRef(null); // Create a ref for the main content area

  return (
    <div className="layout">
      <Head>
        <title>Snacks</title>
      </Head>
      <header>
        {/* Pass the contentRef to the Navbar */}
        <Navbar contentRef={contentRef} />
      </header>
      {/* Wrap children in a main element and assign the ref */}
      <main className="main-container" ref={contentRef}>
       {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default Layout
