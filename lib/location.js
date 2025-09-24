const https = require('https');

/**
 * Geocodes a location string to get latitude and longitude.
 * @param {string} locationString - The location to geocode (e.g., "london").
 * @returns {Promise<{latitude: number, longitude: number} | null>} An object with latitude and longitude, or null if not found.
 */
async function geocodeLocation(locationString) {
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(locationString)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Geocoding API request failed with status ${response.status}:`, errorBody);
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    const results = await response.json();
    if (results && results.length > 0) {
      const { lat, lon } = results[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      console.warn(`Geocoding found no results for location: "${locationString}"`);
      return null; // Explicitly return null when no results are found
    }
  } catch (error) {
    console.error(`An error occurred during geocoding for location: "${locationString}"`, error);
    // Re-throw the error to be caught by the orchestrator
    throw error;
  }
}

module.exports = { geocodeLocation };