import React from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // Import next/image
import { SanityImage } from 'next-sanity-image';
import { client as sanityClient } from '../lib/client';

const Product = ({ product: {image, name, 
slug, price } }) => {
  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className="product-card">
          <SanityImage
            sanityClient={sanityClient}
            image={image && image[0]} // Pass the first image object
            alt={name}
            width={250} // Placeholder: Actual width should be derived from CSS class 'product-image' or image asset
            height={250} // Placeholder: Actual height should be derived from CSS class 'product-image' or image asset
            layout="intrinsic" // Or "responsive" if preferred, but requires parent sizing
            className="product-image"
          />
          <p className="product-name">{name}</p>
          <p className="product-price">N{price}</p>
          <div className="product-card-hover-buttons">
            <button type="button" className="btn-add-to-cart-hover">Add to Cart</button>
            <button type="button" className="btn-quick-view-hover">Quick View</button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Product
