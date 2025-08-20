import React from 'react';
import Link from 'next/link';

import { urlFor } from '../lib/client';
import styles from '../styles/Product.module.css';

const Product = ({ product: { image, name, slug, price } }) => {
  return (
    <div>
      <Link href={`/product/${slug.current}`}>
        <div className={styles.product_card}>
          <img
            src={urlFor(image && image[0])}
            width={250}
            height={250}
            className={styles.product_image}
            alt={name}
          />
          <p className={styles.product_name}>{name}</p>
          <p className={styles.product_price}>${price}</p>
        </div>
      </Link>
    </div>
  );
}

export default Product;
