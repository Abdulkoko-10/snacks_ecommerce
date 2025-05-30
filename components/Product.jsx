import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { urlFor } from '../lib/client';

const Product = ({ product: {image, name, 
slug, price } }) => {
  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className="product-card">
          {image && image[0] && (
            <Image
              src={urlFor(image[0]).url()}
              alt={name}
              width={280} // Base width, CSS will make it responsive
              height={280} // Base height, CSS will make it responsive
              className="product-image"
              layout="responsive" // Will adapt to parent width, constrained by CSS max-height
              objectFit="cover" // Ensures the image covers the area, might crop
            />
          )}
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
