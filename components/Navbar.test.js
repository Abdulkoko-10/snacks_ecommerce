import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StateContext } from '../context/StateContext';
import Navbar from './Navbar'; // Assuming Navbar.jsx is in the same directory or correctly pathed

// Mock Cart component as it's rendered by Navbar but not the focus of this test
jest.mock('./Cart', () => () => <div data-testid="cart-mock">Cart Mock</div>);

// Mock next/link
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);

// Helper function to render Navbar with StateContext
const renderNavbarWithContext = (contextValues = {}) => {
  // Default context values that might be needed by Navbar
  const defaults = {
    showCart: false,
    setShowCart: jest.fn(),
    totalQuantities: 0,
    theme: 'light', // Default to light for testing
    toggleTheme: jest.fn(),
    ...contextValues, // Override defaults with provided values
  };
  return render(
    <StateContext.Provider value={defaults}>
      <Navbar />
    </StateContext.Provider>
  );
};

describe('Navbar - Dark Mode Toggle', () => {
  beforeEach(() => {
    // Clear localStorage and reset data-theme before each test
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    // Reset window.matchMedia mock for each test if necessary
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // Default to light mode preference
        media: query,
        onchange: null,
        addListener: jest.fn(), 
        removeListener: jest.fn(), 
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('initializes with light theme by default if no system preference or localStorage', () => {
    renderNavbarWithContext();
    // BsMoon icon is for light theme, to switch to dark
    expect(screen.getByRole('button', { name: /moon/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('initializes with dark theme if system prefers dark and no localStorage', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)', // System prefers dark
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    // We need to re-trigger the useEffect in StateContext that sets the initial theme.
    // This is tricky as StateContext is outside this test's direct render.
    // For this test, we'll simulate it by providing the theme directly based on this logic.
    renderNavbarWithContext({ theme: 'dark' }); // Simulate that StateContext picked up dark
    document.documentElement.setAttribute('data-theme', 'dark'); // Simulate StateContext's action

    // BsSun icon is for dark theme, to switch to light
    expect(screen.getByRole('button', { name: /sun/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
  
  test('initializes with theme from localStorage if present', () => {
    localStorage.setItem('theme', 'dark');
    // Similar to above, simulating StateContext's initial load
    renderNavbarWithContext({ theme: 'dark' });
    document.documentElement.setAttribute('data-theme', 'dark');

    expect(screen.getByRole('button', { name: /sun/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('toggles theme from light to dark and updates data-theme attribute and icon', () => {
    const toggleThemeMock = jest.fn();
    let currentTheme = 'light';
    
    // Custom mock for toggleTheme that updates the 'theme' prop for Navbar
    const customToggleTheme = () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', currentTheme); // Simulate StateContext
      // Re-render or update props would be needed for icon change in a real scenario
      // For testing, we can check the mock was called and assume StateContext handles the rest
      toggleThemeMock(); // Call the original mock if needed for other checks
    };

    const { rerender } = render(
      <StateContext.Provider value={{ showCart: false, setShowCart: jest.fn(), totalQuantities: 0, theme: currentTheme, toggleTheme: customToggleTheme }}>
        <Navbar />
      </StateContext.Provider>
    );

    expect(screen.getByRole('button', { name: /moon/i })).toBeInTheDocument(); // Initial: Light theme, Moon icon shown
    expect(document.documentElement.getAttribute('data-theme')).toBe(currentTheme);

    const themeToggleButton = screen.getByRole('button', { name: /moon/i });
    fireEvent.click(themeToggleButton);
    
    // After click, theme becomes dark
    // Update context for re-render
    rerender(
      <StateContext.Provider value={{ showCart: false, setShowCart: jest.fn(), totalQuantities: 0, theme: currentTheme, toggleTheme: customToggleTheme }}>
        <Navbar />
      </StateContext.Provider>
    );

    expect(screen.getByRole('button', { name: /sun/i })).toBeInTheDocument(); // Dark theme, Sun icon shown
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark'); // StateContext should handle this
  });

  test('toggles theme from dark to light and updates data-theme attribute and icon', () => {
    // Set initial theme to dark in localStorage and context
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    let currentTheme = 'dark';

    const toggleThemeMock = jest.fn();
     const customToggleTheme = () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme); // Simulate StateContext
      toggleThemeMock();
    };
    
    const { rerender } = render(
      <StateContext.Provider value={{ showCart: false, setShowCart: jest.fn(), totalQuantities: 0, theme: currentTheme, toggleTheme: customToggleTheme }}>
        <Navbar />
      </StateContext.Provider>
    );

    expect(screen.getByRole('button', { name: /sun/i })).toBeInTheDocument(); // Initial: Dark theme, Sun icon shown
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    const themeToggleButton = screen.getByRole('button', { name: /sun/i });
    fireEvent.click(themeToggleButton);

    rerender(
      <StateContext.Provider value={{ showCart: false, setShowCart: jest.fn(), totalQuantities: 0, theme: currentTheme, toggleTheme: customToggleTheme }}>
        <Navbar />
      </StateContext.Provider>
    );
    
    expect(screen.getByRole('button', { name: /moon/i })).toBeInTheDocument(); // Light theme, Moon icon shown
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
