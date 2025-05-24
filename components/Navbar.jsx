import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AiOutlineShopping } from 'react-icons/ai';

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


const Navbar = () => {
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const [themeMode, setThemeMode] = useState('light'); // 'light', 'dark', 'rgb'
  const [rgbColor, setRgbColor] = useState('#324d67'); // Default RGB color
  const [rgbInputColor, setRgbInputColor] = useState(rgbColor); // For the color picker input

  const applyRgbTheme = useCallback((baseColor) => {
    const contrastColor = calculateContrastColor(baseColor);
    const secondaryBackgroundColor = darkenColor(baseColor, 20); // Darken by 20 units

    document.documentElement.style.setProperty('--primary-background-color-rgb', baseColor);
    document.documentElement.style.setProperty('--text-color-rgb', contrastColor);
    document.documentElement.style.setProperty('--secondary-background-color-rgb', secondaryBackgroundColor);
    // Primary and secondary colors for branding elements, links, etc.
    document.documentElement.style.setProperty('--primary-color-rgb', baseColor); // Or a derivative
    document.documentElement.style.setProperty('--secondary-color-rgb', contrastColor); // Or a derivative

    // Potentially update other RGB variables here if needed
    // For example, glassmorphism colors could be derived too.
    // document.documentElement.style.setProperty('--glass-background-color-rgb', hexToRgba(baseColor, 0.25));
    // document.documentElement.style.setProperty('--glass-border-color-rgb', hexToRgba(contrastColor, 0.18));
  }, []);

  // Effect to set initial theme
  useEffect(() => {
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
  }, [applyRgbTheme]);

  const toggleTheme = () => {
    let newMode = 'light';
    document.documentElement.classList.remove('dark-mode', 'rgb-mode');

    if (themeMode === 'light') {
      newMode = 'dark';
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('themeMode', 'dark');
    } else if (themeMode === 'dark') {
      newMode = 'rgb';
      document.documentElement.classList.add('rgb-mode');
      applyRgbTheme(rgbColor); // Apply current or default rgbColor
      localStorage.setItem('themeMode', 'rgb');
      localStorage.setItem('rgbColor', rgbColor); // Save current RGB color
    } else if (themeMode === 'rgb') {
      newMode = 'light';
      // No class for light, ensure others are removed
      localStorage.setItem('themeMode', 'light');
    }
    setThemeMode(newMode);
  };

  const handleRgbColorChange = (event) => {
    const newColor = event.target.value;
    setRgbInputColor(newColor); // Update input immediately for picker UI
    setRgbColor(newColor); // Update actual color state
    applyRgbTheme(newColor);
    localStorage.setItem('rgbColor', newColor);
  };
  
  // Determine toggle state for the visual switch
  // Light: unchecked, Dark: checked, RGB: unchecked (or a third state if UI supported)
  const isToggleChecked = themeMode === 'dark';

  return (
    <div className="navbar-container">
      <p className="logo">
        <Link href="/">Snacks</Link>
      </p>

      <div className="nav-items-right">
        {/* Theme Display (simple text for now) */}
        <span style={{ marginRight: '10px', fontSize: '0.8rem', color: 'var(--text-color)' }}>
          Mode: {themeMode.toUpperCase()}
        </span>

        {/* Theme Toggle Switch */}
        <label className="theme-switch">
          <input type="checkbox" checked={isToggleChecked} onChange={toggleTheme} />
          <span className="slider round"></span>
        </label>

        {/* RGB Color Picker */}
        {themeMode === 'rgb' && (
          <input
            type="color"
            value={rgbInputColor}
            onChange={handleRgbColorChange}
            style={{ marginLeft: '10px', height: '24px', width: '40px', border: 'none', padding: '2px', backgroundColor: 'transparent' }}
            title="Select RGB base color"
          />
        )}

        <button type="button"
          className="cart-icon" onClick={() => setShowCart(true)}>
          <AiOutlineShopping />
          <span className="cart-item-qty">{totalQuantities}</span>
        </button>
      </div>

      {showCart && <Cart />}
    </div>
  );
};

export default Navbar;
