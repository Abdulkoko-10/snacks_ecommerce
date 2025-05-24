import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
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

// Helper functions (copied from Navbar.jsx for direct testing, ideally these would be imported if they were in a utils file)
const calculateContrastColor = (hexColor) => {
  if (!hexColor) return '#000000';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

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

// Mocks
let mockLocalStorageStore = {};
const mockLocalStorage = {
  getItem: jest.fn((key) => mockLocalStorageStore[key] || null),
  setItem: jest.fn((key, value) => {
    mockLocalStorageStore[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete mockLocalStorageStore[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorageStore = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to no system preference for dark
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock document.documentElement elements
let mockDocumentElementClassesStorage = new Set(); // Use a separate variable for storage

const mockClassList = {
    add: jest.fn(cls => mockDocumentElementClassesStorage.add(cls)),
    remove: jest.fn(cls => mockDocumentElementClassesStorage.delete(cls)),
    contains: jest.fn(cls => mockDocumentElementClassesStorage.has(cls)),
    // Helper to get the current classes for assertions
    get _values() { return Array.from(mockDocumentElementClassesStorage); }
};
const mockStyle = {
  _properties: {}, // Store style properties here
  setProperty: jest.fn((prop, value) => { mockStyle._properties[prop] = value; }),
  getPropertyValue: jest.fn(prop => mockStyle._properties[prop] || ''),
   // Helper to get all styles for assertions
  get _values() { return mockStyle._properties; }
};


Object.defineProperty(document, 'documentElement', {
  configurable: true, 
  value: {
    classList: mockClassList,
    style: mockStyle,
  },
});


describe('Navbar Component - Theme Management', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockLocalStorage.clear(); // This now uses the internal clear for mockLocalStorageStore
    // Clear mock function call history
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();

    window.matchMedia.mockClear();
    window.matchMedia.mockImplementation(query => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn() })); // Reset to default
    
    mockDocumentElementClassesStorage.clear(); // Clear the actual storage
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
    mockClassList.contains.mockClear();
    
    mockStyle._properties = {}; // Clear the actual storage
    mockStyle.setProperty.mockClear();
    mockStyle.getPropertyValue.mockClear();
  });

  describe('Initial Theme State', () => {
    it('defaults to "light" theme if no localStorage and no system preference', () => {
      render(<Navbar />);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
      expect(mockClassList.add).not.toHaveBeenCalledWith('dark-mode');
      expect(mockClassList.add).not.toHaveBeenCalledWith('rgb-mode');
    });

    it('initializes to "dark" theme if system prefers dark and no localStorage', () => {
      window.matchMedia.mockImplementation(query => ({ matches: true, media: query, addListener: jest.fn(), removeListener: jest.fn() }));
      render(<Navbar />);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark-mode');
    });

    it('loads "light" theme from localStorage', () => {
      mockLocalStorageStore['themeMode'] = 'light';
      render(<Navbar />);
      expect(mockClassList.remove).toHaveBeenCalledWith('dark-mode');
      expect(mockClassList.remove).toHaveBeenCalledWith('rgb-mode');
      expect(mockClassList.add).not.toHaveBeenCalledWith('dark-mode');
      expect(mockClassList.add).not.toHaveBeenCalledWith('rgb-mode');
    });

    it('loads "dark" theme from localStorage', () => {
      mockLocalStorageStore['themeMode'] = 'dark';
      render(<Navbar />);
      expect(mockClassList.add).toHaveBeenCalledWith('dark-mode');
    });

    it('loads "rgb" theme and color from localStorage', () => {
      mockLocalStorageStore['themeMode'] = 'rgb';
      mockLocalStorageStore['rgbColor'] = '#123456';
      render(<Navbar />);
      expect(mockClassList.add).toHaveBeenCalledWith('rgb-mode');
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', '#123456');
      const contrastColor = calculateContrastColor('#123456');
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--text-color-rgb', contrastColor);
    });
  });

  describe('Theme Toggling', () => {
    it('cycles themes: light -> dark -> rgb -> light', () => {
      const { container } = render(<Navbar />);
      // querySelector for the checkbox part of the theme switch
      const toggle = container.querySelector('.theme-switch input[type="checkbox"]');

      // Initial: light (useEffect runs on render)
      expect(mockLocalStorage.getItem('themeMode')).toBe('light'); 

      // Light -> Dark
      act(() => { fireEvent.click(toggle); });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark-mode');
      
      // Dark -> RGB
      act(() => { fireEvent.click(toggle); });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'rgb');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rgbColor', '#324d67'); // Default initial RGB color
      expect(mockClassList.add).toHaveBeenCalledWith('rgb-mode');
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', '#324d67');

      // RGB -> Light
      act(() => { fireEvent.click(toggle); });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
      expect(mockClassList.remove).toHaveBeenCalledWith('dark-mode');
      expect(mockClassList.remove).toHaveBeenCalledWith('rgb-mode');
    });
  });

  describe('RGB Color Change', () => {
    it('updates RGB color, CSS variables, and localStorage when color picker changes', () => {
      // Set initial state to RGB mode for this test
      mockLocalStorageStore['themeMode'] = 'rgb'; 
      mockLocalStorageStore['rgbColor'] = '#324d67'; // Initial default
      
      const { container } = render(<Navbar />);
      
      // Find the color picker; it should be visible because themeMode is 'rgb'
      const colorPicker = container.querySelector('input[type="color"]');
      expect(colorPicker).toBeInTheDocument(); // Verify it's rendered

      const testColor = '#FFAA00';
      act(() => {
        fireEvent.change(colorPicker, { target: { value: testColor } });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rgbColor', testColor);
      
      const expectedContrast = calculateContrastColor(testColor);
      const expectedSecondaryBg = darkenColor(testColor, 20);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', testColor);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--text-color-rgb', expectedContrast);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--secondary-background-color-rgb', expectedSecondaryBg);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-color-rgb', testColor);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--secondary-color-rgb', expectedContrast);
    });
  });
  
  describe('Helper Functions (Direct Tests)', () => {
    describe('calculateContrastColor', () => {
      it('returns dark color for light background', () => {
        expect(calculateContrastColor('#FFFFFF')).toBe('#000000');
        expect(calculateContrastColor('#AABBCC')).toBe('#000000');
      });
      it('returns light color for dark background', () => {
        expect(calculateContrastColor('#000000')).toBe('#FFFFFF');
        expect(calculateContrastColor('#102030')).toBe('#FFFFFF');
      });
      it('handles invalid input by defaulting to black text', () => {
        expect(calculateContrastColor(null)).toBe('#000000');
        expect(calculateContrastColor(undefined)).toBe('#000000');
        expect(calculateContrastColor('')).toBe('#000000'); // Assuming empty string is invalid hex
      });
    });

    describe('darkenColor', () => {
      it('correctly darkens a color', () => {
        expect(darkenColor('#336699', 20)).toBe('#1f5285'); 
        expect(darkenColor('#000000', 20)).toBe('#000000'); 
        expect(darkenColor('#101010', 20)).toBe('#000000'); 
      });
      it('handles invalid input by returning black', () => {
        expect(darkenColor(null, 20)).toBe('#000000');
        expect(darkenColor(undefined, 20)).toBe('#000000');
        expect(darkenColor('', 20)).toBe('#000000'); // Assuming empty string is invalid hex
      });
    });
  });
});

// Mock for <Link> component from next/link
jest.mock('next/link', () => {
    return ({children, href}) => {
        // Simple pass-through for children, Link functionality not tested here
        return React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                // Add href to the child if it's a valid element (like <a>)
                return React.cloneElement(child, {href: href});
            }
            return child;
        });
    }
});

// Mock for AiOutlineShopping icon
jest.mock('react-icons/ai', () => ({
  AiOutlineShopping: () => <svg data-testid="cart-icon" />
}));
