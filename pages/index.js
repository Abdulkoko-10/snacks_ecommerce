import React, { useState } from 'react';
import { readClient } from "../lib/client";
import { isOrchestratorEnabled } from "../lib/flags";
import { Product, FooterBanner, HeroBanner, SearchControls, RecommendationCarousel } from "../components";

const Home = ({ products, bannerData, source }) => {
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
      const adaptedResults = data.map(result => ({
        placeId: result.placeId,
        reason: `A great choice for a meal.`, // Placeholder reason
        preview: {
          slug: result.placeId,
          title: result.name,
          image: (result.primaryPhoto && result.primaryPhoto.photoUri) || '/FoodDiscovery.jpg',
          rating: result.rating || 0,
          bestProvider: 'Google',
          eta: '10-20 min',
          minPrice: 1000,
        }
      }));
      setResults(adaptedResults);
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
        <div>
          {loading && <p>Loading...</p>}
          {!loading && results.length === 0 && (
            <p>No results found.</p>
          )}
          <RecommendationCarousel recommendations={results} />
        </div>
      ) : (
        <>
          <div className="products-heading">
            <h2>Best Selling Products</h2>
            <p>Snacks of many variations</p>
          </div>
          <div className="products-container">
            {products?.map((product) => <Product key={product._id || product.canonicalProductId} product={product} source={source} />)}
          </div>
        </>
      )}

      <FooterBanner footerBanner={bannerData && bannerData[0]} />
    </div>
  );
};

export const getStaticProps = async () => {
  const useOrchestrator = isOrchestratorEnabled();
  let products;
  let source;

  if (useOrchestrator) {
    console.log('Using Orchestrator for initial product fetch...');
    source = 'orchestrator';
    try {
      // This needs to be the public URL of the orchestrator when deployed,
      // or the local URL during development.
      const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';
      const response = await fetch(`${orchestratorUrl}/api/v1/search`);
      if (!response.ok) {
        throw new Error(`Failed to fetch from orchestrator: ${response.statusText}`);
      }
      products = await response.json();
    } catch (e) {
      console.error("Could not fetch from orchestrator, falling back to Sanity.", e);
      // Fallback to sanity if orchestrator fails
      const productQuery = `*[_type == "product"] | order(_createdAt desc) [0...10]`;
      products = await readClient.fetch(productQuery);
      source = 'sanity';
    }
  } else {
    console.log('Using Sanity for initial product fetch...');
    source = 'sanity';
    const productQuery = `*[_type == "product"] | order(_createdAt desc) [0...10]`;
    products = await readClient.fetch(productQuery);
  }

  const bannerQuery = `*[_type == "banner"]`;
  const bannerData = await readClient.fetch(bannerQuery);

  return {
    props: { products, bannerData, source },
    revalidate: 60,
  };
};

export default Home;
