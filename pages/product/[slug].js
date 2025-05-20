import React, { useState } from "react";
import Image from "next/image";

import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";

import { client, urlFor } from "../../lib/client";
import Product from "../../components/Product";
import { useStateContext } from "../../context/StateContext";

const ProductDetails = ({ product, products }) => {
  // Destructure the product object to get individual properties
  // console.log("product before destructuring:", product);
  const { image, name, details, price } = product;
  // console.log("product after destructuring:", image, name, details, price);
  // Create a state variable to store the current index of the product in the array of products
  const [index, setIndex] = useState(0);
  // Destructure the useStateContext object to get individual properties
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();

  // This function is used to handle the "Buy Now" button click
  const handleBuyNow = () => {
    // Call the onAdd() function, passing in the product and quantity as parameters
    onAdd(product, qty);

    // Set the showCart variable to true to display the cart
    setShowCart(true);
  };

  return (
    <div>
      <div className="product-detail-container">
        <div>
          <div className="image-container">
            {image && image[index] && (
              <Image
                src={urlFor(image && image[index])}
                width={400}
                height={400}
                className="product-detail-image"
                alt={name}
              />
            )}
          </div>
          <div className="small-images-container">
            {image?.map((item, i) => (
              <Image
                key={i}
                src={urlFor(item)}
                width={70}
                height={70}
                className={
                  i === index ? "small-image selected-image" : "small-image"
                }
                onMouseEnter={() => setIndex(i)}
                alt={`${name} - thumbnail ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="product-detail-desc">
          <h1>{name}</h1>
          <div className="reviews">
            <div>
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiFillStar />
              <AiOutlineStar />
            </div>
            <p>(20)</p>
          </div>
          <h4>Details: </h4>
          <p>{details}</p>
          <p className="price">N{price}</p>
          <div className="quantity">
            <h3>Quantity: </h3>
            <p className="quantity-desc">
              <span className="minus" onClick={decQty}>
                <AiOutlineMinus />
              </span>
              <span className="num">{qty}</span>
              <span className="plus" onClick={incQty}>
                <AiOutlinePlus />
              </span>
            </p>
          </div>
          <div className="buttons">
            <button
              type="button"
              className="add-to-cart"
              onClick={() => onAdd(product, qty)}
            >
              Add to Cart
            </button>
            <button type="button" className="buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="maylike-products-wrapper">
        <h2>You may also like</h2>
        <div className="marquee">
          <div className="maylike-products-container track">
            {products.map((item) => (
              <Product key={item._id} product={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticPaths = async () => {
  const query = `*[_type == "product"] {
    slug {
      current
    }
  }`;

  const products = await client.fetch(query);

  const paths = products.map((product) => ({
    params: {
      slug: product.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};

// Export a constant named getStaticProps that is an async function
// which takes in an object containing a property of 'params' with a property of 'slug'
export const getStaticProps = async ({ params: { slug } }) => {
  // Create a query for the product with the given slug
  const query = `*[_type == "product" && slug.
  current == '${slug}'][0]`;
  // Create a query for all products
  const productsQuery = `*[_type == "product"]`;

  // Fetch the product with the given slug
  const product = await client.fetch(query);
  // Fetch all products
  const products = await client.fetch(productsQuery);

  // Return an object containing the fetched products and product
  return {
    props: { products, product },
  };
};

export default ProductDetails;
