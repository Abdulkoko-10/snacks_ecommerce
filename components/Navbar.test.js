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
  FiMoreHorizontal: () => <svg data-testid="fi-more-horizontal" />, 
}));

// Helper functions (copied from Navbar.jsx for direct testing)
const calculateContrastColor = (hexColor) => {
  if (!hexColor || hexColor.length < 6) return '#000000';
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

// ADDED: hexToRgba helper function for glassmorphism tests
const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string' || hex.length < 6) { 
    return `rgba(0,0,0,${alpha})`; 
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(0,0,0,${alpha})`;
  }
  return `rgba(${r},${g},${b},${alpha})`;
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
    matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(),
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

describe.skip('Navbar Component - Theme Management', () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;

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

    addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe('Initial Theme State', () => {
    // ... (tests remain the same)
    it('defaults to "light" theme, shows FiMoon icon, color picker hidden, and ellipsis menu hidden', () => {
        render(<Navbar />);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
        expect(screen.getByTestId('fi-moon')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Activate Dark Mode/i })).toBeInTheDocument();
        expect(screen.queryByTitle(/Select RGB base color/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument(); 
      });
  
      it('initializes click outside listener for theme menu on mount and cleans up on unmount', () => {
        const { unmount } = render(<Navbar />);
        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      });
  });

  describe('Theme Toggling with Cycle Icon Button', () => {
    // ... (tests remain the same)
    it('cycles themes and icons: light (FiMoon) -> dark (FiDroplet) -> rgb (FiSun) -> light (FiMoon)', () => {
        render(<Navbar />);
        const toggleButton = screen.getByRole('button', { name: /Activate Dark Mode/i }); 
  
        act(() => { fireEvent.click(toggleButton); }); 
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
        expect(screen.getByTestId('fi-droplet')).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('title', 'Activate RGB Mode');
        
        act(() => { fireEvent.click(toggleButton); }); 
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'rgb');
        expect(screen.getByTestId('fi-sun')).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('title', 'Activate Light Mode');
        expect(screen.getByTitle(/Select RGB base color/i)).toBeInTheDocument();
  
        act(() => { fireEvent.click(toggleButton); }); 
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
        expect(screen.getByTestId('fi-moon')).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('title', 'Activate Dark Mode');
        expect(screen.queryByTitle(/Select RGB base color/i)).not.toBeInTheDocument();
      });
  });

  describe('Ellipsis Theme Menu', () => {
    // ... (tests remain the same)
    it('toggles dropdown menu visibility on ellipsis button click', () => {
        render(<Navbar />);
        const ellipsisButton = screen.getByRole('button', { name: /More theme options/i });
        expect(screen.queryByRole('list')).not.toBeInTheDocument(); 
  
        act(() => { fireEvent.click(ellipsisButton); });
        expect(screen.getByRole('list')).toBeVisible(); 
  
        act(() => { fireEvent.click(ellipsisButton); });
        expect(screen.queryByRole('list')).not.toBeInTheDocument(); 
      });
  
      it('closes dropdown menu on clicking outside', () => {
        render(<Navbar />);
        const ellipsisButton = screen.getByRole('button', { name: /More theme options/i });
        act(() => { fireEvent.click(ellipsisButton); }); 
        expect(screen.getByRole('list')).toBeVisible();
  
        act(() => {
          fireEvent.mouseDown(document);
        });
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
  
      it('selects "Light Theme" from dropdown', () => {
        render(<Navbar />);
        act(() => { fireEvent.click(screen.getByRole('button', { name: /More theme options/i })); }); 
        act(() => { fireEvent.click(screen.getByText('Light Theme')); });
  
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
        expect(screen.queryByRole('list')).not.toBeInTheDocument(); 
        expect(screen.getByTestId('fi-moon')).toBeInTheDocument(); 
      });
  
      it('selects "Dark Theme" from dropdown', () => {
        render(<Navbar />);
        act(() => { fireEvent.click(screen.getByRole('button', { name: /More theme options/i })); });
        act(() => { fireEvent.click(screen.getByText('Dark Theme')); });
  
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(screen.getByTestId('fi-droplet')).toBeInTheDocument();
      });
  
      it('selects "RGB Theme" from dropdown and applies glassmorphism variables', () => {
        render(<Navbar />);
        act(() => { fireEvent.click(screen.getByRole('button', { name: /More theme options/i })); });
        act(() => { fireEvent.click(screen.getByText('RGB Theme')); });
  
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'rgb');
        const defaultRgbColor = '#324d67'; // Default initial RGB color from component state
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rgbColor', defaultRgbColor);
        expect(mockClassList.add).toHaveBeenCalledWith('rgb-mode');
        expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', defaultRgbColor);
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(screen.getByTestId('fi-sun')).toBeInTheDocument();
        expect(screen.getByTitle(/Select RGB base color/i)).toBeInTheDocument(); 
        
        // Assertions for glassmorphism variables
        const expectedMainContrast = calculateContrastColor(defaultRgbColor);
        const expectedGlassBg = hexToRgba(defaultRgbColor, 0.15);
        const expectedGlassBorder = hexToRgba(expectedMainContrast, 0.2);
        const expectedGlassShadow = hexToRgba('#000000', 0.1);

        expect(mockStyle.setProperty).toHaveBeenCalledWith('--glass-background-color-rgb', expectedGlassBg);
        expect(mockStyle.setProperty).toHaveBeenCalledWith('--glass-border-color-rgb', expectedGlassBorder);
        expect(mockStyle.setProperty).toHaveBeenCalledWith('--glass-box-shadow-color-rgb', expectedGlassShadow);
      });
  });

  describe('RGB Color Change and applyRgbTheme Logic', () => {
    // UPDATED test to include glassmorphism assertions
    it('updates CSS variables correctly including glassmorphism per "SAFER APPROACH" and localStorage when color picker changes', () => {
      mockLocalStorageStore['themeMode'] = 'rgb'; 
      mockLocalStorageStore['rgbColor'] = '#324d67'; // Initial default before user interaction
      render(<Navbar />);
      
      const colorPicker = screen.getByTitle(/Select RGB base color/i);
      expect(colorPicker).toBeInTheDocument();

      const testColor = '#FFAA00'; // User selects this color
      const expectedColor = '#ffaa00'; // Browsers often convert to lowercase
      act(() => { fireEvent.change(colorPicker, { target: { value: testColor } }); });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rgbColor', expectedColor);
      
      const expectedMainContrast = calculateContrastColor(testColor);
      const expectedSecondaryBg = darkenColor(testColor, 15); 

      // Core theme colors
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-background-color-rgb', testColor);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--text-color-rgb', expectedMainContrast);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--secondary-background-color-rgb', expectedSecondaryBg);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--primary-color-rgb', testColor);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--secondary-color-rgb', expectedMainContrast);

      // NEW Assertions for Glassmorphism:
      const expectedGlassBg = hexToRgba(testColor, 0.15);
      const expectedGlassBorder = hexToRgba(expectedMainContrast, 0.2);
      const expectedGlassShadow = hexToRgba('#000000', 0.1);

      expect(mockStyle.setProperty).toHaveBeenCalledWith('--glass-background-color-rgb', expectedGlassBg);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--glass-border-color-rgb', expectedGlassBorder);
      expect(mockStyle.setProperty).toHaveBeenCalledWith('--glass-box-shadow-color-rgb', expectedGlassShadow);

      // Ensure status message colors are NOT set by JS
      expect(mockStyle.setProperty).not.toHaveBeenCalledWith('--plus-color-rgb', expect.anything());
    });
  });
  
  describe('Helper Functions (Direct Tests)', () => {
    // Unchanged
    describe('calculateContrastColor', () => {
      it('returns dark color for light background', () => expect(calculateContrastColor('#FFFFFF')).toBe('#000000'));
      it('returns light color for dark background', () => expect(calculateContrastColor('#000000')).toBe('#FFFFFF'));
      it('handles invalid input by defaulting to black text', () => {
        expect(calculateContrastColor(null)).toBe('#000000');
        expect(calculateContrastColor(undefined)).toBe('#000000');
        expect(calculateContrastColor('')).toBe('#000000');
      });
    });
    describe('darkenColor', () => {
      it('correctly darkens a color', () => expect(darkenColor('#336699', 15)).toBe('#24578a'));
      it('handles clamping at 0', () => expect(darkenColor('#000000', 15)).toBe('#000000'));
      it('handles invalid input by returning black', () => {
        expect(darkenColor(null, 15)).toBe('#000000');
        expect(darkenColor(undefined, 15)).toBe('#000000');
        expect(darkenColor('', 15)).toBe('#000000');
      });
    });
    // ADDED: hexToRgba direct tests
    describe('hexToRgba', () => {
        it('correctly converts valid hex to rgba', () => {
            expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255,0,0,0.5)');
            expect(hexToRgba('#00FF00', 1)).toBe('rgba(0,255,0,1)');
            expect(hexToRgba('#0000FF', 0)).toBe('rgba(0,0,255,0)');
        });
        it('handles short hex (assumes full length needed, returns default)', () => {
            expect(hexToRgba('#F00', 0.5)).toBe('rgba(0,0,0,0.5)'); // Based on current validation
        });
        it('handles invalid hex characters (returns default)', () => {
            expect(hexToRgba('#GGHHII', 0.5)).toBe('rgba(0,0,0,0.5)'); // parseInt will yield NaN
        });
        it('handles null or undefined hex (returns default)', () => {
            expect(hexToRgba(null, 0.5)).toBe('rgba(0,0,0,0.5)');
            expect(hexToRgba(undefined, 0.5)).toBe('rgba(0,0,0,0.5)');
        });
        it('handles empty string hex (returns default)', () => {
            expect(hexToRgba('', 0.5)).toBe('rgba(0,0,0,0.5)');
        });
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
jest.mock('react-icons/ai', () => ({ AiOutlineShopping: () => <svg data-testid="cart-icon" /> }));
