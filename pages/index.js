import React, { useState } from 'react';
import { readClient } from "../lib/client";
import { FooterBanner, HeroBanner } from "../components";

const Home = ({ bannerData }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {bannerData?.[0] && <HeroBanner heroBanner={bannerData[0]} />}

      <div className="products-heading">
        <h2>Find Your Next Meal</h2>
        <p>Search for restaurants, cafes, and more in your city</p>
      </div>

      <div className="search-container" style={{ textAlign: 'center', margin: '40px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'pizza in new york'"
          style={{ padding: '10px', width: '300px', marginRight: '10px', fontSize: '16px' }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

      <div className="products-container">
        {searched && !loading && results.length === 0 && (
          <p>No results found.</p>
        )}
        {results.map((restaurant) => (
          <div key={restaurant.placeId} className="product-card" style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
            <h3>{restaurant.name}</h3>
            <p>{restaurant.address}</p>
            <p>Rating: {restaurant.rating || 'N/A'}</p>
          </div>
        ))}
      </div>

      <FooterBanner footerBanner={bannerData && bannerData[0]} />
    </div>
  );
};

export const getStaticProps = async () => {
  // We keep getStaticProps to fetch banner data at build time.
  // The products are now fetched client-side.
  const bannerQuery = `*[_type == "banner"]`;
  const bannerData = await readClient.fetch(bannerQuery);

  return {
    props: { bannerData },
    revalidate: 60,
  };
};

export default Home;
