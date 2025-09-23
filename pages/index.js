import React, { useState } from 'react';
import { readClient } from "../lib/client";
import { Product, FooterBanner, HeroBanner, SearchResultCard, SearchControls, SearchResultsCarousel } from "../components";

const Home = ({ products, bannerData }) => {
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

      <div className="search-section">
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
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

      {searched ? (
        loading ? (
          <div className="products-heading"><p>Loading...</p></div>
        ) : results.length > 0 ? (
          <SearchResultsCarousel results={results} />
        ) : (
          <div className="products-heading"><p>No results found.</p></div>
        )
      ) : (
        <>
          <div className="products-heading">
            <h2>Best Selling Products</h2>
            <p>Snacks of many variations</p>
          </div>
          <div className="products-container">
            {products?.map((product) => <Product key={product._id} product={product} />)}
          </div>
        </>
      )}

      <FooterBanner footerBanner={bannerData && bannerData[0]} />
    </div>
  );
};

export const getStaticProps = async () => {
  // The original query for products is kept for the initial page load.
  const productQuery = `*[_type == "product"] | order(_createdAt desc) [0...10]`;
  const products = await readClient.fetch(productQuery);

  const bannerQuery = `*[_type == "banner"]`;
  const bannerData = await readClient.fetch(bannerQuery);

  return {
    props: { products, bannerData },
    revalidate: 60,
  };
};

export default Home;
