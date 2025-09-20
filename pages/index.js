import React from "react";
import { readClient } from "../lib/client";
import { getProducts } from '../lib/data-access'; // Import new data access function

import { Product, FooterBanner, HeroBanner } from "../components";

const Home = ({ products, bannerData }) => {
  return (
    <div>
      {bannerData?.[0] && ( // Conditional rendering for safety
        <HeroBanner heroBanner={bannerData[0]} />
      )}
      <div className="products-heading">
        <h2>Best Selling Products</h2>
        <p>Samosas of different Tastes</p>
      </div>

      <div className="products-container">
        {products?.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>

      <FooterBanner footerBanner={bannerData && bannerData[0]} />
    </div>
  );
};

export const getStaticProps = async () => {
  // Fetch products from MongoDB
  const products = await getProducts();

  // Keep fetching banner data from Sanity for now
  const bannerQuery = `*[_type == "banner"]`;
  const bannerData = await readClient.fetch(bannerQuery);

  return {
    props: { products, bannerData },
    revalidate: 60,
  };
};

export default Home;
