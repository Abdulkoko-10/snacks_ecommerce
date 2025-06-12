import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNextSanityImage } from 'next-sanity-image';
import { client as sanityClient } from '../lib/client';

const Product = ({ product: {image, name, 
slug, price } }) => {
  const imageProps = useNextSanityImage(
    sanityClient, // Sanity client
    image && image[0] // The Sanity image object
  );

  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className="product-card">
          {imageProps && ( // Render only if imageProps are valid
            <Image
              {...imageProps}
              alt={name}
              // Specify layout, width, and height if not fully covered by imageProps
              // For product cards, 'intrinsic' or 'responsive' with aspect ratio is common.
              // If imageProps doesn't provide width/height, we might need to set them.
              // Let's assume imageProps provides width & height for now, common for this hook.
              // If not, placeholder dimensions would be needed like before, e.g. width={250} height={250}
              layout="intrinsic" // Or responsive, but ensure parent provides aspect ratio
              className="product-image" // Keep existing className for styling
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
