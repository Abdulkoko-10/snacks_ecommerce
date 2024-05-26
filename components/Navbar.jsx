import React from 'react'
import Link from 'next/link'
import { AiOutlineShopping } from 'react-icons/ai'

import { Cart } from './';
import { useStateContext } from '../context/StateContext';

const Navbar = () => {
  const { showCart, setShowCart, totalQuantities } = useStateContext();

  return (
    <div className="navbar-container">
      <p className="logo">
        <Link href="/">Snacks</Link>
      </p>

      <button type="button"
      className="cart-icon" onClick={() => setShowCart(true)}>
        <AiOutlineShopping />s
        <span className="cart-item-qty">{totalQuantities}</span>
      </button>

{/* This code snippet is using JavaScript's template literal syntax
 and is rendering a Cart component if the showCart variable is true. */}
      {showCart && <Cart />}

    </div>
  )
}

export default Navbar