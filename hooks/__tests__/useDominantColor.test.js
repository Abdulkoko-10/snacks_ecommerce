// hooks/__tests__/useDominantColor.test.js
import { renderHook, act } from '@testing-library/react'; // Using @testing-library/react
import { waitFor } from '@testing-library/dom'; // For waiting for async updates
import useDominantColor from '../useDominantColor';

// Mock fast-average-color
const mockGetColorAsync = jest.fn();
jest.mock('fast-average-color', () => ({
  FastAverageColor: jest.fn().mockImplementation(() => ({
    getColorAsync: mockGetColorAsync,
  })),
}));

// Mock lodash.debounce to return the function directly (no debouncing during tests)
// or use jest.useFakeTimers() for more advanced debounce testing.
// For simplicity, we'll bypass debounce for most unit tests of the core logic.
jest.mock('lodash.debounce', () => jest.fn((fn) => fn));


describe('useDominantColor', () => {
  let mockContentRef;
  let mockImageElement;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetColorAsync.mockReset();
    jest.clearAllMocks(); // Clears debounce mock calls too

    // Setup mock DOM elements
    mockImageElement = document.createElement('img');
    mockImageElement.src = 'test-image.jpg';
    // Mock properties for a loaded image
    Object.defineProperty(mockImageElement, 'complete', { value: true, writable: true });
    Object.defineProperty(mockImageElement, 'naturalHeight', { value: 100, writable: true });

    mockContentRef = {
      current: document.createElement('div'),
    };
  });

  afterEach(() => {
    // jest.restoreAllMocks(); // Not strictly necessary if using jest.clearAllMocks and jest.resetAllMocks appropriately
  });

  test('should return defaultColor initially if provided', () => {
    const { result } = renderHook(() => useDominantColor(mockContentRef, { defaultColor: '#FF0000' }));
    expect(result.current.dominantColor).toBe('#FF0000');
    expect(result.current.error).toBeNull();
  });

  test('should return null initially if no defaultColor is provided', () => {
    const { result } = renderHook(() => useDominantColor(mockContentRef));
    expect(result.current.dominantColor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should extract color from a loaded image', async () => {
    mockContentRef.current.appendChild(mockImageElement);
    mockGetColorAsync.mockResolvedValue({ hex: '#123456' });

    const { result } = renderHook(() => useDominantColor(mockContentRef));

    await waitFor(() => expect(result.current.dominantColor).toBe('#123456'));
    expect(mockGetColorAsync).toHaveBeenCalledWith(mockImageElement);
    expect(result.current.error).toBeNull();
  });

  test('should handle image not yet loaded and then load event', async () => {
    Object.defineProperty(mockImageElement, 'complete', { value: false, writable: true });
    mockContentRef.current.appendChild(mockImageElement);
    mockGetColorAsync.mockResolvedValue({ hex: '#ABCDEF' });

    const { result } = renderHook(() => useDominantColor(mockContentRef));

    act(() => { // act for event dispatch
      mockImageElement.dispatchEvent(new Event('load'));
    });

    await waitFor(() => expect(result.current.dominantColor).toBe('#ABCDEF'));
    expect(mockGetColorAsync).toHaveBeenCalledWith(mockImageElement);
  });

  test('should set error and use defaultColor if color extraction fails', async () => {
    mockContentRef.current.appendChild(mockImageElement);
    const errorMessage = 'Test error';
    mockGetColorAsync.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDominantColor(mockContentRef, { defaultColor: '#0000FF' }));

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.dominantColor).toBe('#0000FF');
    });
  });

  test('should set error if no image is found and no default color', async () => {
    // No image in mockContentRef.current
    const mockComputedStyle = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ backgroundColor: 'rgba(0, 0, 0, 0)' });

    const { result } = renderHook(() => useDominantColor(mockContentRef));

    await waitFor(() => {
        expect(result.current.dominantColor).toBeNull();
        expect(result.current.error).toMatch(/No image found and no valid background color/i);
    });
    mockComputedStyle.mockRestore();
  });

  test('should use content element background color if no image and background is valid', async () => {
    const mockComputedStyle = jest.spyOn(window, 'getComputedStyle').mockReturnValueOnce({ backgroundColor: 'rgb(255, 0, 0)' }); // Red

    const { result } = renderHook(() => useDominantColor(mockContentRef));

    await waitFor(() => expect(result.current.dominantColor).toBe('rgb(255, 0, 0)'));
    expect(result.current.error).toBeNull();
    mockComputedStyle.mockRestore();
  });

  test('should set error and default color if contentRef.current is null', async () => {
    const { result } = renderHook(() => useDominantColor({ current: null }, { defaultColor: '#111111' }));

    await waitFor(() => {
        expect(result.current.dominantColor).toBe('#111111');
        expect(result.current.error).toBe('Content reference is not available.');
    });
    expect(mockGetColorAsync).not.toHaveBeenCalled();
  });

  // Example for testing debounce with fake timers (more involved)
  // describe('useDominantColor with observer and debounce', () => {
  //   beforeEach(() => {
  //     jest.useFakeTimers();
  //     // Mock MutationObserver
  //     global.MutationObserver = jest.fn(() => ({
  //       observe: jest.fn(),
  //       disconnect: jest.fn(),
  //     }));
  //     // Ensure lodash.debounce uses Jest's fake timers
  //     jest.mock('lodash.debounce', () => jest.fn((fn, wait) => {
  //       const debounced = (...args) => {
  //         setTimeout(() => fn(...args), wait);
  //       };
  //       debounced.cancel = jest.fn();
  //       return debounced;
  //     }));
  //   });
  //
  //   afterEach(() => {
  //     jest.useRealTimers();
  //     jest.unmock('lodash.debounce'); // Unmock to restore original for other tests if needed
  //     delete global.MutationObserver;
  //   });
  //
  //   test('should debounce calls from MutationObserver', async () => {
  //     mockContentRef.current.appendChild(mockImageElement);
  //     mockGetColorAsync.mockResolvedValue({ hex: '#123456' }); // Initial color
  //
  //     const { rerender } = renderHook(
  //       (props) => useDominantColor(props.contentRef, props.options),
  //       { initialProps: { contentRef: mockContentRef, options: { observe: true, debounceWait: 300 } } }
  //     );
  //
  //     // Wait for initial color extraction
  //     await waitFor(() => expect(mockGetColorAsync).toHaveBeenCalledTimes(1));
  //
  //     // Simulate a mutation
  //     const observerCallback = MutationObserver.mock.calls[0][0];
  //     act(() => {
  //       observerCallback([{ type: 'attributes', attributeName: 'src' }]);
  //     });
  //     act(() => { // Simulate another mutation quickly
  //       observerCallback([{ type: 'attributes', attributeName: 'src' }]);
  //     });
  //
  //     // mockGetColorAsync should not have been called again yet
  //     expect(mockGetColorAsync).toHaveBeenCalledTimes(1);
  //
  //     // Fast-forward time
  //     act(() => {
  //       jest.advanceTimersByTime(300);
  //     });
  //
  //     // Now it should have been called for the debounced changes
  //     // It might be called once if the internal check in debounced function is effective
  //     await waitFor(() => expect(mockGetColorAsync).toHaveBeenCalledTimes(2)); // Or 1 if no actual change detected by internal logic
  //   });
  // });
});
