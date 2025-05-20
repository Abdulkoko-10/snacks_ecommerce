import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { StateContext } from '../context/StateContext';
import Navbar from './Navbar';

// Mock Cart component
jest.mock('./Cart', () => {
  const CartMock = () => <div data-testid="cart-mock">Cart Mock</div>;
  CartMock.displayName = 'Cart';
  return CartMock;
});

// Mock next/link
jest.mock('next/link', () => {
  const LinkMock = ({ children, href }) => <a href={href}>{children}</a>;
  LinkMock.displayName = 'Link';
  return LinkMock;
});

const mockStateContextValues = {
  showCart: false,
  setShowCart: jest.fn(),
  totalQuantities: 0,
  // Theme related props are not needed from context as Navbar manages its own theme state
};

const renderNavbar = (contextValues = mockStateContextValues) => {
  return render(
    <StateContext.Provider value={contextValues}>
      <Navbar />
    </StateContext.Provider>
  );
};

describe('Navbar - Theme Toggle Functionality', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset class list on documentElement
    document.documentElement.className = '';
    // Reset matchMedia mock to default (prefers light)
    window.matchMedia.mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test('renders without crashing', () => {
    renderNavbar();
    expect(screen.getByText('Snacks')).toBeInTheDocument(); // Logo text
    expect(screen.getByRole('checkbox')).toBeInTheDocument(); // Theme toggle switch
    expect(screen.getByRole('button', { name: /cart-icon/i })).toBeInTheDocument(); // Cart icon button
  });

  describe('Initial Render', () => {
    test('initializes to light mode by default (no localStorage, no system preference)', () => {
      renderNavbar();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light'); // Navbar sets this default
      const toggleSwitch = screen.getByRole('checkbox');
      expect(toggleSwitch.checked).toBe(false);
    });

    test('initializes to dark mode if localStorage has "dark" theme saved', () => {
      localStorage.setItem('theme', 'dark');
      renderNavbar();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
      const toggleSwitch = screen.getByRole('checkbox');
      expect(toggleSwitch.checked).toBe(true);
    });

    test('initializes to light mode if localStorage has "light" theme saved', () => {
      localStorage.setItem('theme', 'light');
      renderNavbar();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
      const toggleSwitch = screen.getByRole('checkbox');
      expect(toggleSwitch.checked).toBe(false);
    });

    test('initializes to dark mode if system preference is "dark" and no localStorage', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: true, // System prefers dark
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      renderNavbar();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark'); // Navbar sets this based on system pref
      const toggleSwitch = screen.getByRole('checkbox');
      expect(toggleSwitch.checked).toBe(true);
    });
  });

  describe('Theme Toggling', () => {
    test('switches from light to dark mode on toggle', () => {
      renderNavbar(); // Initial is light mode by default setup in beforeEach/default mocks

      const toggleSwitch = screen.getByRole('checkbox');
      expect(toggleSwitch.checked).toBe(false); // Starts unchecked (light)
      expect(document.documentElement.classList.contains('dark-mode')).toBe(false);

      fireEvent.click(toggleSwitch);

      expect(toggleSwitch.checked).toBe(true); // Now checked (dark)
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('switches from dark to light mode on toggle', () => {
      localStorage.setItem('theme', 'dark'); // Start in dark mode
      renderNavbar();

      const toggleSwitch = screen.getByRole('checkbox');
      expect(toggleSwitch.checked).toBe(true); // Starts checked (dark)
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');


      fireEvent.click(toggleSwitch);

      expect(toggleSwitch.checked).toBe(false); // Now unchecked (light)
      expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });

    test('toggle switch state reflects theme changes accurately', () => {
      renderNavbar();
      const toggleSwitch = screen.getByRole('checkbox');

      // Light to Dark
      fireEvent.click(toggleSwitch);
      expect(toggleSwitch.checked).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');

      // Dark to Light
      fireEvent.click(toggleSwitch);
      expect(toggleSwitch.checked).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });
});
