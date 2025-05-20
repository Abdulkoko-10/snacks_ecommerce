import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AiOutlineShopping } from 'react-icons/ai'

import { Cart } from './';
import { useStateContext } from '../context/StateContext';

const Navbar = () => {
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect to set initial theme based on localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let initialDarkMode = false;

    if (savedTheme === 'dark') {
      initialDarkMode = true;
    } else if (savedTheme === 'light') {
      initialDarkMode = false;
    } else if (systemPrefersDark) {
      initialDarkMode = true;
      localStorage.setItem('theme', 'dark'); // Save system preference
    } else {
      initialDarkMode = false; // Default to light
      localStorage.setItem('theme', 'light');
    }

    setIsDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, []); // Empty dependency array means this effect runs once on mount

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  return (
    <div className="navbar-container">
      <p className="logo">
        <Link href="/">Snacks</Link>
      </p>

      <div className="nav-items-right">
        {/* Theme Toggle Switch */}
        <label className="theme-switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>

        <button type="button"
        className="cart-icon" onClick={() => setShowCart(true)}>
          <AiOutlineShopping />s
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
