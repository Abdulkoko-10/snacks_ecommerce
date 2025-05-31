import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import { Cart } from './';
import { useStateContext } from '../context/StateContext';

const Layout = ( { children } ) => {
  const { showCart } = useStateContext();

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
      {showCart && <Cart />}
    </div>
  )
}

export default Layout