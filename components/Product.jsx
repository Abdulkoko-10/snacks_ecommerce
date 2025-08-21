import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/product-card.module.css';
import Image from 'next/image'; // Import next/image

import { urlFor } from '../lib/client';

const Product = ({ product: {image, name, 
slug, price } }) => {
  // Ensure image and image[0] exist before calling urlFor
  const imageUrl = image && image[0] ? urlFor(image[0]).url() : '/placeholder.png'; // Fallback if no image

  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className={styles.productCard}>
          <Image
            src={imageUrl}
            alt={name} // Already using name for alt
            width={250} // Placeholder, adjust based on actual CSS/design
            height={250} // Placeholder, adjust based on actual CSS/design
            className={styles.productImage}
          />
          <p className={styles.productName}>{name}</p>
          <p className={styles.productPrice}>N{price}</p>
          <div className={styles.productCardHoverButtons}>
            <button type="button" className={styles.btnAddToCartHover}>Add to Cart</button>
            <button type="button" className={styles.btnQuickViewHover}>Quick View</button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Product
