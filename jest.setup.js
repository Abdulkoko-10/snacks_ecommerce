// jest.setup.js
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to light mode
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success' }), // Default success response
  })
);

// Mock CSS imports for libraries like Swiper
jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/navigation', () => ({}));

// --- Jules's Additions for Fixing Tests ---

// Mock the Sanity client used for data fetching
jest.mock('./lib/client', () => ({
  readClient: {
    fetch: jest.fn().mockResolvedValue([]),
  },
  previewClient: {
    fetch: jest.fn().mockResolvedValue([]),
  },
  urlFor: jest.fn((source) => ({
    width: () => ({
      url: () => `http://mock-sanity-image.url/${source?.asset?._ref || 'test'}`,
    }),
    url: () => `http://mock-sanity-image.url/${source?.asset?._ref || 'test'}`,
  })),
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
      replace: jest.fn(),
    };
  },
}));
