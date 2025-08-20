import React from "react";
import Link from "next/link";
import Image from 'next/image'; // Import next/image

import { urlFor } from "../lib/client";
import styles from './HeroBanner.module.css';

const HeroBanner = ({ heroBanner }) => {
  return (
    <div className={styles.hero_banner_container}>
      <div>
        <p className={styles.beats_solo}>{heroBanner.smallText}</p>
        <h3>{heroBanner.midText}</h3>
        <h1>{heroBanner.largeText1}</h1>
        <div className={styles.hero_banner_image_container}> {/* Optional container for positioning context */}
          <Image
            src={urlFor(heroBanner.image).url()}
            alt={heroBanner.product || heroBanner.smallText || 'Hero banner image'}
            width={450} // From CSS
            height={450} // From CSS
            className={styles.hero_banner_image} // This class might need adjustment
            priority // Mark as priority if it's LCP
            // layout="responsive"  // Consider if this is needed instead of fixed width/height
            // objectFit="cover"    // Consider if this is needed
          />
        </div>

        <div>
          <Link href={`/product/${heroBanner.product}`}>
            <button type="button">{heroBanner.buttonText}</button>
          </Link>
          <div className={styles.desc}>
            <h5>Description</h5>
            <p>{heroBanner.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
