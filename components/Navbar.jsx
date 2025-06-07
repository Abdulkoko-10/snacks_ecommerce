import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AiOutlineShopping } from 'react-icons/ai';
import { FiSun, FiMoon, FiDroplet, FiMoreHorizontal } from 'react-icons/fi'; // Import Feather icons
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

import { Cart } from './';
import { useStateContext } from '../context/StateContext';

// Helper to calculate contrast color (black or white)
const calculateContrastColor = (hexColor) => {
  if (!hexColor) return '#000000'; // Default to black if color is invalid
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Helper to darken a hex color
const darkenColor = (hexColor, amount) => {
  if (!hexColor) return '#000000';
  let color = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Helper to convert hex to rgba
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
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const { theme, setTheme, resolvedTheme } = useTheme();
  // const [themeMode, setThemeMode] = useState('light'); // Removed, replaced by next-themes
  const [rgbColor, setRgbColor] = useState('#324d67'); // Default RGB color
  const [rgbInputColor, setRgbInputColor] = useState(rgbColor); // For the color picker input
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null); // For detecting clicks outside
  const [isScrolled, setIsScrolled] = useState(false);

  const applyRgbTheme = useCallback((selectedRgbColor) => {
    const mainContrastColor = calculateContrastColor(selectedRgbColor);
    const secondaryBackgroundColor = darkenColor(selectedRgbColor, 15); // Slightly less dark than before

    // 1. Main background
    document.documentElement.style.setProperty('--primary-background-color-rgb', selectedRgbColor);
    
    // 2. Main text color (contrast to main background)
    document.documentElement.style.setProperty('--text-color-rgb', mainContrastColor);
    
    // 3. Secondary background (for cards, etc.)
    document.documentElement.style.setProperty('--secondary-background-color-rgb', secondaryBackgroundColor);
    
    // 4. Primary accent color (links, and importantly, background for some buttons)
    //    Set to the selectedRgbColor itself. Text on these elements will use --text-on-primary-color,
    //    which in .rgb-mode is an alias for --text-color-rgb (mainContrastColor), ensuring visibility.
    document.documentElement.style.setProperty('--primary-color-rgb', selectedRgbColor);
    
    // 5. Secondary text color (logo, some subheadings)
    //    Set to mainContrastColor to ensure it's visible against selectedRgbColor.
    //    This makes it consistent with the main text color.
    document.documentElement.style.setProperty('--secondary-color-rgb', mainContrastColor);

    // Note: --text-on-primary-color is handled by CSS:
    // In .rgb-mode, it's set to var(--text-color-rgb).
    // Since --primary-color-rgb is set to selectedRgbColor, and --text-color-rgb is mainContrastColor (contrast of selectedRgbColor),
    // elements using background:var(--primary-color) and color:var(--text-on-primary-color) will have correct contrast.

    // Status message colors (--plus-color-rgb, --success-icon-color-rgb, etc.) are not changed here.
    // They will retain their default values defined in the CSS, which is often desired for status indicators.

    // Other RGB variables like glassmorphism or product card shadows can also be updated here
    // if more granular control is needed beyond their CSS defaults (which are based on light theme).
    // For example:
    document.documentElement.style.setProperty('--glass-background-color-rgb', hexToRgba(selectedRgbColor, 0.25));
    document.documentElement.style.setProperty('--glass-border-color-rgb', hexToRgba(mainContrastColor, 0.18));
    // For the box shadow, let's use a generic dark shadow for RGB mode, or it could be derived too.
    // Using a slightly less intense version of the dark mode shadow for now.
    document.documentElement.style.setProperty('--glass-box-shadow-color-rgb', 'rgba(0, 0, 0, 0.3)');


    // Set the scrolled navbar background for RGB mode, considering mobile viewport
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches;
    const scrolledRgbAlpha = isMobile ? 0.7 : 0.85;
    document.documentElement.style.setProperty('--scrolled-navbar-bg-rgb', hexToRgba(selectedRgbColor, scrolledRgbAlpha));
  }, []);

  // Effect for scroll, click-outside, and initial RGB color loading
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    const handleClickOutside = (event) => {
      if (event.target.closest && event.target.closest('[class*="cl-"]')) {
        return;
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const savedRgbColor = localStorage.getItem('rgbColor');
    if (savedRgbColor) {
      setRgbColor(savedRgbColor);
      setRgbInputColor(savedRgbColor);
      // Initial application if theme is already 'rgb' handled by the other useEffect
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array for one-time setup

  // Effect to apply RGB theme when theme is 'rgb' or rgbColor changes
  useEffect(() => {
    if (theme === 'rgb') {
      const colorToApply = localStorage.getItem('rgbColor') || rgbColor;
      if (colorToApply !== rgbColor) { // If local storage had a different color not yet in state
        setRgbColor(colorToApply);
        setRgbInputColor(colorToApply);
      }
      applyRgbTheme(colorToApply);
    }
  }, [theme, rgbColor, applyRgbTheme]);


  const toggleTheme = () => {
    if (resolvedTheme === 'light') setTheme('dark');
    else if (resolvedTheme === 'dark') setTheme('rgb');
    else setTheme('light');
  };
  
  const selectTheme = (selectedMode) => {
    setTheme(selectedMode);
    setShowThemeMenu(false);
  };

  const handleRgbColorChange = (event) => {
    const newColor = event.target.value;
    setRgbInputColor(newColor);
    setRgbColor(newColor);
    localStorage.setItem('rgbColor', newColor);
    // If current theme is 'rgb', the useEffect watching [theme, rgbColor] will call applyRgbTheme.
  };
  
  let currentThemeIcon;
  let themeIconTitle = "Toggle Theme";
  if (resolvedTheme === 'light') {
    currentThemeIcon = <FiMoon size={22} />;
    themeIconTitle = "Activate Dark Mode";
  } else if (resolvedTheme === 'dark') {
    currentThemeIcon = <FiDroplet size={22} />;
    themeIconTitle = "Activate RGB Mode";
  } else { // resolvedTheme could be 'rgb' or system default that resolved to 'rgb'
    currentThemeIcon = <FiSun size={22} />;
    themeIconTitle = "Activate Light Mode";
  }

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

        {/* RGB Color Picker */}
        {theme === 'rgb' && (
          <input
            type="color"
            value={rgbInputColor}
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
              <SignedIn>
                <li className="user-button-li">
                  <UserButton
                    afterSignOutUrl="/"
                  />
                </li>
              </SignedIn>
              <SignedOut>
                <li>
                  <SignInButton
                    mode="modal"
                  >
                    {/* This span helps if SignInButton doesn't take full width or needs text styling like other li items */}
                    <span style={{ display: 'block', width: '100%', cursor: 'pointer' }}>
                      Sign In
                    </span>
                  </SignInButton>
                </li>
              </SignedOut>
            </ul>
          )}
        </div>
      </div>

      {showCart && <Cart />}
    </div>
  );
};

export default Navbar;
