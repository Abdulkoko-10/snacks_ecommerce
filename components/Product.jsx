import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image

import { urlFor } from '../lib/client';

const Product = ({ product: {image, name, 
slug, price } }) => {
  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className="product-card">
          <Image
            src={urlFor(image && image[0]).url()} // Add .url()
            alt={name} // Already using name for alt
            width={250}
            height={250}
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
