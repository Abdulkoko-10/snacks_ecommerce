import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Product = ({ product }) => {
  // This component now expects the product prop to be a CanonicalProduct.
  // No more normalization is needed.

  if (!product || !product.canonicalProductId) {
    // Don't render if the product or its ID is missing.
    return null;
  }

  const {
    canonicalProductId,
    title,
    images,
    price,
  } = product;

  const displayImage = images && images.length > 0 ? images[0] : '/placeholder.png';

  return (
    <div>
      <Link href={`/product/${canonicalProductId}`}>
        <div className="product-card">
          <Image
            src={displayImage}
            alt={title}
            width={250}
            height={250}
            className="product-image"
          />
          <p className="product-name">{title}</p>
          <p className="product-price">N{price?.amount}</p>
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
