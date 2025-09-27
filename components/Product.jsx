import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { urlFor } from '../lib/client';

const Product = ({ product, source }) => {
  // --- Data Normalization ---
  // Adapt the product data based on its source (legacy Sanity or new orchestrator)
  let displayProduct;

  if (source === 'orchestrator' && product.preview) {
    // Data from the orchestrator follows the CanonicalProduct schema
    displayProduct = {
      name: product.preview.title,
      imageUrl: product.preview.image,
      price: product.preview.minPrice,
      slug: product.preview.slug || product.canonicalProductId,
    };
  } else {
    // Default to the original Sanity data structure
    displayProduct = {
      name: product.name,
      imageUrl: product.image && product.image[0] ? urlFor(product.image[0]).url() : '/placeholder.png',
      price: product.price,
      slug: product.slug?.current,
    };
  }

  // If for some reason the slug is still not available, we shouldn't render a broken link.
  if (!displayProduct.slug) {
    // Optionally, render a non-link version or null
    return null;
  }

  return (
    <div>
      <Link href={`/product/${displayProduct.slug}`}>
        <div className="product-card">
          <Image
            src={displayProduct.imageUrl}
            alt={displayProduct.name}
            width={250}
            height={250}
            className="product-image"
          />
          <p className="product-name">{displayProduct.name}</p>
          <p className="product-price">N{displayProduct.price}</p>
          <div className="product-card-hover-buttons">
            <button type="button" className="btn-add-to-cart-hover">Add to Cart</button>
            <button type="button" className="btn-quick-view-hover">Quick View</button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Product;
