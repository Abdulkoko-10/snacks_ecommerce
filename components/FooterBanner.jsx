import React from 'react'
import Link from 'next/link'
import Image from 'next/image'; // Import next/image

import { urlFor } from '../lib/client'
import styles from './FooterBanner.module.css';

const FooterBanner = ({ footerBanner: { 
discount, largeText1, largeText2, saleTime,
smallText, midText, desc, product, buttonText, image
} }) => {
  return (
    <div className={styles.footer_banner_container}>
      <div className={styles.banner_desc}>
        <div className={styles.left}>
          <p>{discount}</p>
          <h3>{largeText1}</h3>
          <h3>{largeText2}</h3>
          <p>{saleTime}</p>
        </div>
        <div className={styles.right}>
          <p>{smallText}</p>
          <h3>{midText}</h3>
          <p>{desc}</p>
          <Link href={`/product/${product}`}>
            <button type="button">{buttonText}</button>
          </Link>
        </div>

        {/* <img 
          src={urlFor(image)}
          className="footer-banner-image"
        /> */}
        <div className={styles.footer_banner_image_container}> {/* Added a container for positioning context if needed */}
          <Image
            src={urlFor(image).url()}
            alt={midText || 'Footer banner promotion'}
            width={450} // From CSS
            height={450} // From CSS
            className={styles.footer_banner_image} // This class might need adjustment for next/image
            // layout="responsive" // Consider this if aspect ratio should be maintained based on parent
            // objectFit="cover"   // Use with layout="responsive" or "fill"
          />
        </div>
      </div>
    </div>
  )
}

export default FooterBanner
