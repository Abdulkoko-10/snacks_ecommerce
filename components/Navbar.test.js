import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Navbar from './Navbar'; // Adjust path as needed
import { useStateContext } from '../context/StateContext'; // Adjust path

// Mock useStateContext
jest.mock('../context/StateContext', () => ({
  useStateContext: jest.fn(() => ({
    showCart: false,
    setShowCart: jest.fn(),
    totalQuantities: 0,
  })),
}));

// Mock Feather Icons
jest.mock('react-icons/fi', () => ({
  FiSun: () => <svg data-testid="fi-sun" />,
  FiMoon: () => <svg data-testid="fi-moon" />,
  FiDroplet: () => <svg data-testid="fi-droplet" />,
}));

// Helper functions (copied from Navbar.jsx for direct testing, ideally these would be imported if they were in a utils file)
const calculateContrastColor = (hexColor) => {
  if (!hexColor || hexColor.length < 6) return '#000000'; // Basic validation
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const darkenColor = (hexColor, amount) => {
  if (!hexColor || hexColor.length < 6) return '#000000';
  let color = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Mocks for localStorage and document
let mockLocalStorageStore = {};
const mockLocalStorage = {
  getItem: jest.fn((key) => mockLocalStorageStore[key] || null),
  setItem: jest.fn((key, value) => { mockLocalStorageStore[key] = String(value); }),
  removeItem: jest.fn((key) => { delete mockLocalStorageStore[key]; }),
  clear: jest.fn(() => { mockLocalStorageStore = {}; }),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

let mockDocumentElementClassesStorage = new Set();
const mockClassList = {
    add: jest.fn(cls => mockDocumentElementClassesStorage.add(cls)),
    remove: jest.fn(cls => mockDocumentElementClassesStorage.delete(cls)),
    contains: jest.fn(cls => mockDocumentElementClassesStorage.has(cls)),
    get _values() { return Array.from(mockDocumentElementClassesStorage); }
};
const mockStyle = {
  _properties: {},
  setProperty: jest.fn((prop, value) => { mockStyle._properties[prop] = value; }),
  getPropertyValue: jest.fn(prop => mockStyle._properties[prop] || ''),
  get _values() { return mockStyle._properties; }
};

Object.defineProperty(document, 'documentElement', {
  configurable: true, 
  value: { classList: mockClassList, style: mockStyle },
});


describe('Navbar Component - Theme Management', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    window.matchMedia.mockClear();
    window.matchMedia.mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn() }));
    
    mockDocumentElementClassesStorage.clear();
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
    mockClassList.contains.mockClear();
    
    mockStyle._properties = {};
    mockStyle.setProperty.mockClear();
    mockStyle.getPropertyValue.mockClear();
  });

  describe('Initial Theme State', () => {
    it('defaults to "light" theme, shows FiMoon icon, and color picker is hidden', () => {
      render(<Navbar />);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
      expect(mockClassList.add).not.toHaveBeenCalledWith('dark-mode');
      expect(mockClassList.add).not.toHaveBeenCalledWith('rgb-mode');
      expect(screen.getByTestId('fi-moon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Activate Dark Mode/i })).toBeInTheDocument();
      expect(screen.queryByTitle(/Select RGB base color/i)).not.toBeInTheDocument();
    });

    it('initializes to "dark" theme if system prefers dark, shows FiDroplet icon', () => {
      window.matchMedia.mockImplementation(query => ({ matches: true, media: query, addListener: jest.fn(), removeListener: jest.fn() }));
      render(<Navbar />);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark-mode');
      expect(screen.getByTestId('fi-droplet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Activate RGB Mode/i })).toBeInTheDocument();
    });

    it('loads "rgb" theme and color from localStorage, shows FiSun icon, and color picker is visible', () => {
      mockLocalStorageStore['themeMode'] = 'rgb';
      mockLocalStorageStore['rgbColor'] = '#123456';
      render(<Navbar />);
      expect(mockClassList.add).toHaveBeenCalledWith('rgb-mode');
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', '#123456');
      const contrastColor = calculateContrastColor('#123456');
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--text-color-rgb', contrastColor);
      expect(screen.getByTestId('fi-sun')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Activate Light Mode/i })).toBeInTheDocument();
      expect(screen.getByTitle(/Select RGB base color/i)).toBeInTheDocument();
    });
  });

  describe('Theme Toggling with Icon Button', () => {
    it('cycles themes and icons: light (FiMoon) -> dark (FiDroplet) -> rgb (FiSun) -> light (FiMoon)', () => {
      render(<Navbar />);
      const toggleButton = screen.getByRole('button', { name: /Activate Dark Mode/i }); // Initial state: Light

      // Initial: Light, shows FiMoon, title "Activate Dark Mode"
      expect(mockLocalStorage.getItem('themeMode')).toBe('light');
      expect(screen.getByTestId('fi-moon')).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('title', 'Activate Dark Mode');
      expect(screen.queryByTitle(/Select RGB base color/i)).not.toBeInTheDocument();

      // Light -> Dark
      act(() => { fireEvent.click(toggleButton); });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark-mode');
      expect(screen.getByTestId('fi-droplet')).toBeInTheDocument(); // Icon updates
      expect(toggleButton).toHaveAttribute('title', 'Activate RGB Mode'); // Title updates
      expect(screen.queryByTitle(/Select RGB base color/i)).not.toBeInTheDocument();
      
      // Dark -> RGB
      act(() => { fireEvent.click(toggleButton); });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'rgb');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rgbColor', '#324d67'); // Default initial RGB color
      expect(mockClassList.add).toHaveBeenCalledWith('rgb-mode');
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', '#324d67');
      expect(screen.getByTestId('fi-sun')).toBeInTheDocument(); // Icon updates
      expect(toggleButton).toHaveAttribute('title', 'Activate Light Mode'); // Title updates
      expect(screen.getByTitle(/Select RGB base color/i)).toBeInTheDocument(); // Color picker appears

      // RGB -> Light
      act(() => { fireEvent.click(toggleButton); });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
      expect(mockClassList.remove).toHaveBeenCalledWith('dark-mode');
      expect(mockClassList.remove).toHaveBeenCalledWith('rgb-mode');
      expect(screen.getByTestId('fi-moon')).toBeInTheDocument(); // Icon updates
      expect(toggleButton).toHaveAttribute('title', 'Activate Dark Mode'); // Title updates
      expect(screen.queryByTitle(/Select RGB base color/i)).not.toBeInTheDocument(); // Color picker disappears
    });
  });

  describe('RGB Color Change and applyRgbTheme Logic', () => {
    it('updates CSS variables correctly per "SAFER APPROACH" and localStorage when color picker changes', () => {
      mockLocalStorageStore['themeMode'] = 'rgb'; 
      mockLocalStorageStore['rgbColor'] = '#324d67';
      render(<Navbar />);
      
      const colorPicker = screen.getByTitle(/Select RGB base color/i);
      expect(colorPicker).toBeInTheDocument();

      const testColor = '#FFAA00'; // User selects this color
      act(() => {
        fireEvent.change(colorPicker, { target: { value: testColor } });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rgbColor', testColor);
      
      const expectedMainContrast = calculateContrastColor(testColor);
      const expectedSecondaryBg = darkenColor(testColor, 15); // Updated darken amount

      // Verifying setProperty calls based on "SAFER APPROACH"
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', testColor);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--text-color-rgb', expectedMainContrast);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--secondary-background-color-rgb', expectedSecondaryBg);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-color-rgb', testColor);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--secondary-color-rgb', expectedMainContrast);

      // Ensure status message colors are NOT set by JS
      expect(mockStyle.setProperty).not.toHaveBeenCalledWith('--plus-color-rgb', expect.anything());
      expect(mockStyle.setProperty).not.toHaveBeenCalledWith('--success-icon-color-rgb', expect.anything());
    });
  });
  
  describe('Helper Functions (Direct Tests)', () => {
    // These tests remain unchanged as helper function logic itself didn't change
    describe('calculateContrastColor', () => {
      it('returns dark color for light background', () => expect(calculateContrastColor('#FFFFFF')).toBe('#000000'));
      it('returns light color for dark background', () => expect(calculateContrastColor('#000000')).toBe('#FFFFFF'));
      it('handles invalid input', () => expect(calculateContrastColor('')).toBe('#000000'));
    });
    describe('darkenColor', () => {
      it('correctly darkens a color', () => expect(darkenColor('#336699', 15)).toBe('#24578a')); // Adjusted for amount 15
      it('handles clamping at 0', () => expect(darkenColor('#000000', 15)).toBe('#000000'));
      it('handles invalid input', () => expect(darkenColor('', 15)).toBe('#000000'));
    });
  });
});

// Mock for <Link> component from next/link (remains unchanged)
jest.mock('next/link', () => {
    return ({children, href}) => {
        return React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {href: href});
            }
            return child;
        });
    }
});

// Mock for AiOutlineShopping icon (remains unchanged)
jest.mock('react-icons/ai', () => ({
  AiOutlineShopping: () => <svg data-testid="cart-icon" />
}));
