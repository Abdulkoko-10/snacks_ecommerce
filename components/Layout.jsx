import React from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'
import Cart from './Cart' // Import Cart component
import { useStateContext } from '../context/StateContext'; // Import context

const Layout = ( { children } ) => {
  const { showCart } = useStateContext(); // Get showCart state

  return (
    <div className="layout">
      <Head>
        <title>Snacks</title>
      </Head>
      <header>
        <Navbar />
      </header>
      <main className="main-container">
       {showCart && <Cart />} {/* Conditionally render Cart here */}
       {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default Layout