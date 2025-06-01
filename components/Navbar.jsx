import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AiOutlineShopping } from 'react-icons/ai';
import { FiSun, FiMoon, FiDroplet, FiMoreHorizontal } from 'react-icons/fi'; // Import Feather icons

import { Cart } from './';
import { useStateContext } from '../context/StateContext';

// Helper to convert hex to rgba - kept if still needed for specific component logic not covered by global theme vars
const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string' || hex.length < 6) { // Basic validation
    return `rgba(0, 0, 0, ${alpha})`; // Default to black with alpha on error
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) { // Check if parsing failed
    return `rgba(0, 0, 0, ${alpha})`; // Default to black with alpha on error
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


const Navbar = () => {
  const {
    showCart,
    setShowCart,
    totalQuantities,
    themeMode,
    rgbColor,
    setAndStoreTheme
  } = useStateContext();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null); // For detecting clicks outside
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect for scroll and clicks outside theme menu
  useEffect(() => {
    // Scroll handler
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Handle clicks outside the theme menu to close it
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    let newMode;
    if (themeMode === 'light') newMode = 'dark';
    else if (themeMode === 'dark') newMode = 'rgb';
    else newMode = 'light'; // themeMode === 'rgb'
    setAndStoreTheme(newMode);
  };
  
  const selectTheme = (selectedMode) => {
    setAndStoreTheme(selectedMode);
    setShowThemeMenu(false);
  };

  const handleRgbColorChange = (event) => {
    const newColor = event.target.value;
    setAndStoreTheme('rgb', newColor);
  };
  
  // Determine which icon to display based on the current themeMode from context
  let currentThemeIcon;
  let themeIconTitle = "Toggle Theme";
  if (themeMode === 'light') {
    currentThemeIcon = <FiMoon size={22} />;
    themeIconTitle = "Activate Dark Mode";
  } else if (themeMode === 'dark') {
    currentThemeIcon = <FiDroplet size={22} />;
    themeIconTitle = "Activate RGB Mode";
  } else { // themeMode === 'rgb'
    currentThemeIcon = <FiSun size={22} />;
    themeIconTitle = "Activate Light Mode";
  }

  // Update scrolled navbar background based on themeMode and rgbColor from context
  // This assumes CSS variables set by StateContext are sufficient.
  // If specific rgba is needed here, hexToRgba can be used with rgbColor.
  // For now, relying on global CSS variables like --scrolled-navbar-bg
  // which should be defined in globals.css and updated by StateContext's classes.
  // Example: .rgb-mode .scrolled-navbar { background-color: var(--scrolled-navbar-bg-rgb); }
  // The actual CSS variable --scrolled-navbar-bg-rgb should be set by applyRgbThemeLogic in StateContext
  // or directly in setAndStoreTheme if needed. Let's assume StateContext handles this.

  return (
    <div className={`navbar-container glassmorphism ${isScrolled ? 'scrolled-navbar' : ''}`}>
      <p className="logo">
        <Link href="/">Snacks</Link>
      </p>

      <div className="nav-items-right">
        <button 
          type="button" 
          className="theme-icon-button" 
          onClick={toggleTheme}
          title={themeIconTitle}
          aria-label={themeIconTitle}
        >
          {currentThemeIcon}
        </button>

        {/* RGB Color Picker - uses rgbColor from context directly */}
        {themeMode === 'rgb' && (
          <input
            type="color"
            value={rgbColor}
            onChange={handleRgbColorChange}
            className="rgb-color-picker"
            title="Select RGB base color"
          />
        )}

        <button type="button"
          className="cart-icon" onClick={() => setShowCart(true)}>
          <AiOutlineShopping />
          <span className="cart-item-qty">{totalQuantities}</span>
        </button>

        {/* New Ellipsis Menu Button & Dropdown */}
        <div className="theme-menu-container" ref={themeMenuRef}>
          <button
            type="button"
            className="theme-ellipsis-button"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title="More theme options"
            aria-label="More theme options"
          >
            <FiMoreHorizontal size={22} />
          </button>
          {showThemeMenu && (
            <ul className="theme-dropdown-menu">
              <li onClick={() => selectTheme('light')}>Light Theme</li>
              <li onClick={() => selectTheme('dark')}>Dark Theme</li>
              <li onClick={() => selectTheme('rgb')}>RGB Theme</li>
            </ul>
          )}
        </div>
      </div>

      {showCart && <Cart />}
    </div>
  );
};

export default Navbar;
