import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image

import { urlFor } from '../lib/client';

const Product = ({ product: {image, name, 
slug, price } }) => {
  // Ensure image and image[0] exist before calling urlFor
  const imageUrl = image && image[0] ? urlFor(image[0]).url() : '/placeholder.png'; // Fallback if no image

  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className="product-card">
          <Image
            src={imageUrl}
            alt={name} // Already using name for alt
            width={250} // Placeholder, adjust based on actual CSS/design
            height={250} // Placeholder, adjust based on actual CSS/design
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
