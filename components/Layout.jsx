import React from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ( { children, clerkAppearance } ) => { // clerkAppearance added here
  return (
    <div className="layout">
      <Head>
        <title>Snacks</title>
      </Head>
      <header>
        <Navbar clerkAppearance={clerkAppearance} /> {/* clerkAppearance passed here */}
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