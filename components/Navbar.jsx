import React from 'react'
import Link from 'next/link'
import { AiOutlineShopping } from 'react-icons/ai'
import { BsSun, BsMoon } from 'react-icons/bs' // Importing theme icons

import { Cart } from './';
import { useStateContext } from '../context/StateContext';

const Navbar = () => {
  const { showCart, setShowCart, totalQuantities, theme, toggleTheme } = useStateContext();

  return (
    <div className="navbar-container">
      <p className="logo">
        <Link href="/">Snacks</Link>
      </p>

      <div style={{ display: 'flex', alignItems: 'center' }}> {/* Wrapper for cart and theme toggle */}
        <button 
          type="button"
          className="cart-icon" 
          onClick={toggleTheme} 
          style={{ marginRight: '20px', fontSize: '20px' }} // Added styling for the theme toggle
        >
          {theme === 'light' ? <BsMoon /> : <BsSun />}
        </button>

        <button type="button"
        className="cart-icon" onClick={() => setShowCart(true)}>
          <AiOutlineShopping /> {/* It seems there's an extra 's' here, remove if not intended */}
          <span className="cart-item-qty">{totalQuantities}</span>
        </button>
      </div>

{/* This code snippet is using JavaScript's template literal syntax
 and is rendering a Cart component if the showCart variable is true. */}
      {showCart && <Cart />}

    </div>
  )
}

export default Navbar