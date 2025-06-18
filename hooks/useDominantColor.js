import { useState, useEffect, useCallback, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';
import debounce from 'lodash.debounce'; // Import debounce

const fac = new FastAverageColor();

const useDominantColor = (contentRef, options = {}) => {
  const { defaultColor = null, observe = false, debounceWait = 300 } = options; // Added debounceWait option
  const [dominantColor, setDominantColor] = useState(defaultColor);
  const [error, setError] = useState(null);
  // Keep track of the last processed image source to avoid unnecessary recalculations if observer triggers but image is same.
  const lastProcessedImageSrcRef = useRef(null);

  // Debounced version of calculateColor logic specifically for the observer
  const debouncedCalculateColorRef = useRef(null);


  const calculateColor = useCallback(async (element) => {
    if (!element) {
      setError('Target element for color calculation is not available.');
      if (defaultColor) setDominantColor(defaultColor);
      lastProcessedImageSrcRef.current = null; // Ensure reset if element is gone
      return;
    }

    const imageElement = element.querySelector('img');

    if (imageElement) {
      try {
        // Ensure image is loaded before processing
        if (imageElement.complete && imageElement.naturalHeight !== 0) {
          const color = await fac.getColorAsync(imageElement);
          setDominantColor(color.hex);
          setError(null);
          lastProcessedImageSrcRef.current = imageElement.src;
        } else if (imageElement.src) { // If src is present, it might still be loading
          const handleLoad = async () => {
            try {
              const color = await fac.getColorAsync(imageElement);
              setDominantColor(color.hex);
              setError(null);
              lastProcessedImageSrcRef.current = imageElement.src;
            } catch (err) {
              console.error('Error getting color after image load:', err);
              setError(err.message);
              if (defaultColor) setDominantColor(defaultColor);
              lastProcessedImageSrcRef.current = null; // Error case
            }
            imageElement.removeEventListener('load', handleLoad);
            imageElement.removeEventListener('error', handleError);
          };
          const handleError = (errEvent) => {
            console.error('Error loading image for color sampling:', errEvent);
            setError('Image failed to load for color sampling.');
            if (defaultColor) setDominantColor(defaultColor);
            lastProcessedImageSrcRef.current = null; // Error case
            imageElement.removeEventListener('load', handleLoad);
            imageElement.removeEventListener('error', handleError);
          };
          imageElement.addEventListener('load', handleLoad);
          imageElement.addEventListener('error', handleError);
        } else {
          // No src, or image is not valid for processing
          setError('No valid image source found for color sampling.');
          if (defaultColor) setDominantColor(defaultColor);
          lastProcessedImageSrcRef.current = null;
        }
      } catch (err) {
        console.error('Error calculating dominant color from image:', err);
        setError(err.message);
        if (defaultColor) setDominantColor(defaultColor);
        lastProcessedImageSrcRef.current = null; // Error case
      }
    } else {
      // Fallback: If no image, try to use the background color of the contentRef itself
      try {
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          setDominantColor(bgColor);
          setError(null);
        } else {
          setError('No image found and no valid background color on content element.');
          if (defaultColor) setDominantColor(defaultColor);
        }
      } catch (err) {
          console.error('Error getting background color from content element:', err);
          setError(err.message);
          if (defaultColor) setDominantColor(defaultColor);
      }
      lastProcessedImageSrcRef.current = null; // No image, so reset
    }
  }, [defaultColor]);

  // Effect for initial calculation and setting up observer
  useEffect(() => {
    const targetElement = contentRef.current;
    if (!targetElement) {
      // If targetElement is not available, ensure we reset to defaultColor if specified
      if (defaultColor) setDominantColor(defaultColor);
      setError('Content reference is not available.');
      return;
    }

    // Initial calculation without debounce
    calculateColor(targetElement);
    // lastProcessedImageSrcRef.current is set within calculateColor

    if (observe) {
      // Create/update the debounced function if it doesn't exist or if debounceWait changes
      if (!debouncedCalculateColorRef.current || (debouncedCalculateColorRef.current.wait !== debounceWait && typeof debouncedCalculateColorRef.current.cancel === 'function') ) {
          // If an old debounced function exists, cancel it before creating a new one
          if (debouncedCalculateColorRef.current && debouncedCalculateColorRef.current.cancel) {
            debouncedCalculateColorRef.current.cancel();
          }
          debouncedCalculateColorRef.current = debounce(() => {
            const currentImg = targetElement.querySelector('img');
            const currentImgSrc = currentImg?.src;
            // Only recalculate if the image source has actually changed,
            // or if an image was added/removed.
            if (currentImgSrc !== lastProcessedImageSrcRef.current ||
                (currentImg && !lastProcessedImageSrcRef.current) ||
                (!currentImg && lastProcessedImageSrcRef.current)) {
              calculateColor(targetElement);
            }
          }, debounceWait);
          // Store wait time on the ref to check if it changed
          if (debouncedCalculateColorRef.current) {
            debouncedCalculateColorRef.current.wait = debounceWait;
          }
      }

      const observer = new MutationObserver((mutationsList) => {
        // Call the debounced function on any mutation.
        // The debounced function itself contains the logic to check if recalculation is needed.
        if (debouncedCalculateColorRef.current) {
            debouncedCalculateColorRef.current();
        }
      });

      observer.observe(targetElement, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: ['src', 'style', 'class'] // Be more specific on attributes
        });

      return () => {
        observer.disconnect();
        if (debouncedCalculateColorRef.current && debouncedCalculateColorRef.current.cancel) {
          debouncedCalculateColorRef.current.cancel(); // Cancel any pending executions on cleanup
        }
      };
    } else {
      // If not observing, ensure any existing debounced function is cancelled and observer disconnected
       if (debouncedCalculateColorRef.current && debouncedCalculateColorRef.current.cancel) {
          debouncedCalculateColorRef.current.cancel();
       }
    }
  }, [contentRef, calculateColor, observe, debounceWait, defaultColor]); // Added defaultColor

  return { dominantColor, error };
};

export default useDominantColor;
