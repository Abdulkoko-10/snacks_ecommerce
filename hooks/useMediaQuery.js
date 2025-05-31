import { useState, useEffect } from 'react';

// Custom hook to check if a media query matches, made SSR-safe.
const useMediaQuery = (query) => {
  // Initialize with a default value, false is often a safe default for SSR.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Only run this effect on the client side where 'window' is defined.
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);

      // Update state with the initial match value immediately after client-side mount.
      if (media.matches !== matches) { // Check to avoid unnecessary re-render if initial state was already correct
        setMatches(media.matches);
      }

      // Listener for changes to the media query status.
      const listener = () => {
        setMatches(media.matches);
      };

      // Modern browsers use addEventListener for 'change' event on MediaQueryList.
      // This is more efficient than listening to 'resize' for media query changes.
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else if (media.addListener) { // Fallback for older browsers
        media.addListener(listener);
      }

      // Cleanup function to remove the listener when the component unmounts or query changes.
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else if (media.removeListener) { // Fallback for older browsers
          media.removeListener(listener);
        }
      };
    }
  }, [query]); // Effect only re-runs if the media query string itself changes.
                // 'matches' was removed from dependencies to prevent potential stale closures or unnecessary re-runs.

  return matches;
};

export default useMediaQuery;
