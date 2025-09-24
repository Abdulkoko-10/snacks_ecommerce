import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image

// urlFor is no longer needed for orchestrator-driven products, but we keep it for now
// in case some parts of the app still use Sanity directly.
import { urlFor } from '../lib/client';

const Product = ({ product: { image, name, slug, price } }) => {
  let imageUrl;

  if (image && image[0]) {
    // The data can now come from two sources:
    // 1. Sanity: an image object that needs to be processed by urlFor.
    // 2. Orchestrator: an 'adapted' object with a direct `url` property.
    imageUrl = image[0].asset?.url || urlFor(image[0]).url();
  } else {
    imageUrl = '/placeholder.png'; // Fallback for products with no image.
  }

  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className="product-card">
          <Image
            src={imageUrl}
            alt={name}
            width={250}
            height={250}
            className="product-image"
            // Using unoptimized is a good general approach for external images.
            unoptimized
          />
          <p className="product-name">{name}</p>
          {/* Assuming N is for Naira, we can make currency dynamic later */}
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

export default Product;
