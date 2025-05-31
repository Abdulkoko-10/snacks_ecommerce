import { useState, useEffect } from 'react';

const useMediaQuery = (query) => {
  // Initialize state: `matches` holds the media query result, `mounted` tracks client-side mount.
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Component has mounted on the client.
    setMounted(true);

    const media = window.matchMedia(query);

    // Function to update matches state
    const updateMatches = () => {
      setMatches(media.matches);
    };

    // Set the initial value after mount
    updateMatches();

    // Listen for changes in the media query result
    media.addEventListener('change', updateMatches);

    // Cleanup listener on unmount
    return () => {
      media.removeEventListener('change', updateMatches);
    };
  }, [query]); // Effect runs once on mount and if query changes

  // Before component is mounted on the client, we can't know the media query result.
  // Returning a default (e.g., false for mobile-first) or an indicator like undefined.
  // If we return `false` (matches' initial state) when not mounted, `isDesktop` would be `false`.
  // This means it defaults to mobile view during SSR and initial client render before this effect runs.
  // This is often a safe default to prevent flashing desktop content on mobile.
  if (!mounted) {
    // To ensure server and client initial render are consistent for `isDesktop`,
    // and avoid rendering based on a potentially incorrect default `matches` = false,
    // we could return an "indeterminate" state or the initial `matches` value.
    // Given `matches` is `false` initially, returning `matches` here means `isDesktop`
    // will be `false` on the server and on the first client render, which is a consistent mobile-first approach.
    return false; // Or return a value that Cart.jsx can interpret as "loading" e.g. undefined
  }

  return matches;
};

export default useMediaQuery;
