import React, { useState } from 'react';
import { readClient } from "../lib/client";
import { FooterBanner, HeroBanner, SearchResultCard, SearchControls } from "../components";

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

      <SearchControls
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        loading={loading}
      />

      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

      <div className="products-container">
        {searched && !loading && results.length === 0 && (
          <p>No results found.</p>
        )}
        {results.map((restaurant) => (
          <SearchResultCard key={restaurant.placeId} restaurant={restaurant} />
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
