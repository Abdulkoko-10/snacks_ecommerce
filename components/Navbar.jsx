import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AiOutlineShopping } from 'react-icons/ai';
import { FiSun, FiMoon, FiDroplet, FiMoreHorizontal } from 'react-icons/fi'; // Import Feather icons

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
  const [themeMode, setThemeMode] = useState('light'); // 'light', 'dark', 'rgb'
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
    // document.documentElement.style.setProperty('--glass-background-color-rgb', hexToRgba(selectedRgbColor, 0.25)); // Requires hexToRgba
    // document.documentElement.style.setProperty('--glass-border-color-rgb', hexToRgba(mainContrastColor, 0.18));

    // Set the scrolled navbar background for RGB mode, considering mobile viewport
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches;
    const scrolledRgbAlpha = isMobile ? 0.7 : 0.85;
    document.documentElement.style.setProperty('--scrolled-navbar-bg-rgb', hexToRgba(selectedRgbColor, scrolledRgbAlpha));
  }, []);

  // Effect to set initial theme & handle clicks outside theme menu
  useEffect(() => {
    // Scroll handler
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call handler once on mount to check initial scroll position
    handleScroll();

    const savedThemeMode = localStorage.getItem('themeMode');
    const savedRgbColor = localStorage.getItem('rgbColor');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    document.documentElement.classList.remove('dark-mode', 'rgb-mode'); // Clear old classes

    if (savedThemeMode === 'rgb' && savedRgbColor) {
      setThemeMode('rgb');
      setRgbColor(savedRgbColor);
      setRgbInputColor(savedRgbColor);
      document.documentElement.classList.add('rgb-mode');
      applyRgbTheme(savedRgbColor);
    } else if (savedThemeMode === 'dark') {
      setThemeMode('dark');
      document.documentElement.classList.add('dark-mode');
    } else if (savedThemeMode === 'light') {
      setThemeMode('light');
      // No class needed for light mode by default, ensure others are removed
    } else if (systemPrefersDark) {
      setThemeMode('dark');
      localStorage.setItem('themeMode', 'dark');
      document.documentElement.classList.add('dark-mode');
    } else {
      setThemeMode('light'); // Default to light
      localStorage.setItem('themeMode', 'light');
    }

    // Handle clicks outside the theme menu to close it
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll); // Cleanup scroll listener
    };

  }, [applyRgbTheme]); // applyRgbTheme is a dependency, keep it if it's stable or memoized correctly

  const setAndStoreTheme = (newThemeMode, newRgbColor = rgbColor) => {
    document.documentElement.classList.remove('dark-mode', 'rgb-mode');
    localStorage.setItem('themeMode', newThemeMode);
    setThemeMode(newThemeMode);

    if (newThemeMode === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else if (newThemeMode === 'rgb') {
      document.documentElement.classList.add('rgb-mode');
      applyRgbTheme(newRgbColor);
      setRgbColor(newRgbColor); // Ensure internal state is also up-to-date
      setRgbInputColor(newRgbColor); // Sync input picker
      localStorage.setItem('rgbColor', newRgbColor);
    }
    // For 'light' mode, no class is added beyond removing others.
  };

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
    setRgbInputColor(newColor); // Update input immediately for picker UI
    setRgbColor(newColor); // Update actual color state
    applyRgbTheme(newColor);
    localStorage.setItem('rgbColor', newColor);
  };
  
  // Determine toggle state for the visual switch
  // Determine which icon to display based on the current themeMode
  let currentThemeIcon;
  let themeIconTitle = "Toggle Theme";
  if (themeMode === 'light') {
    currentThemeIcon = <FiMoon size={22} />; // Icon to switch to Dark
    themeIconTitle = "Activate Dark Mode";
  } else if (themeMode === 'dark') {
    currentThemeIcon = <FiDroplet size={22} />;  // Icon to switch to RGB
    themeIconTitle = "Activate RGB Mode";
  } else { // themeMode === 'rgb'
    currentThemeIcon = <FiSun size={22} />;  // Icon to switch to Light
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
        {themeMode === 'rgb' && (
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
            </ul>
          )}
        </div>
      </div>

      {showCart && <Cart />}
    </div>
  );
};

export default Navbar;
