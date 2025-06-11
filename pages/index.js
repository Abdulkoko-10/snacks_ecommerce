import React from "react";
import { client } from "../lib/client";

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
// Export a constant named getServerSideProps which is an async function
export const getServerSideProps = async () => {
  // Create a query for all products
  const query = `*[_type == "product"]`;
  // Fetch all products using the query
  const products = await client.fetch(query);

  // Create a query for all banners
  const bannerQuery = `*[_type == "banner"]`;
  // Fetch all banners using the query
  const bannerData = await client.fetch(bannerQuery);

  // Return an object containing the products and bannerData as props
  return {
    props: { products, bannerData },
  };
};

export default Home;
