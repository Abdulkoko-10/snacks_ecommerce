import React, { useState, useEffect } from "react";
import { readClient } from "../lib/client";

import { Product, FooterBanner, HeroBanner } from "../components";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch products from our own API proxy
        const productsResponse = await fetch(`/api/products`);
        if (!productsResponse.ok) {
          // The proxy will return a detailed error, so we can display it.
          const errorData = await productsResponse.json();
          throw new Error(errorData.error || `Failed to fetch products: ${productsResponse.statusText}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Keep fetching banner data from Sanity for now
        const bannerQuery = `*[_type == "banner"]`;
        const bannerData = await readClient.fetch(bannerQuery);
        setBannerData(bannerData);

      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}. Is the orchestrator running?</p>;
  }

  return (
    <div>
      {bannerData?.[0] && (
        <HeroBanner heroBanner={bannerData[0]} />
      )}
      <div className="products-heading">
        <h2>Discover Your Next Meal</h2>
        <p>Selections from all over the world</p>
      </div>

      <div className="products-container">
        {products?.map((product) => {
          // Adapt CanonicalProduct to the props expected by the old Product component
          const adaptedProduct = {
            _id: product.canonicalProductId,
            name: product.title,
            // The old component expects a slug object, we can mock it
            // In the future, product pages will also be driven by canonicalId
            slug: { current: product.canonicalProductId },
            // The old component expects a single price number and a single image object
            price: product.price.amount,
            // Pass only the first image, and in the structure the old component expects
            image: product.images && product.images.length > 0
              ? [{ _type: 'image', asset: { _ref: product.images[0], url: product.images[0] } }]
              : [], // Handle cases with no images
          };
          return <Product key={adaptedProduct._id} product={adaptedProduct} />;
        })}
      </div>

      <FooterBanner footerBanner={bannerData && bannerData[0]} />
    </div>
  );
};

export default Home;
