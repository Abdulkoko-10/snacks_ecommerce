import React from "react";
import Link from "next/link";
import Image from 'next/image'; // Import next/image

import { urlFor } from "../lib/client";

const HeroBanner = ({ heroBanner }) => {
  return (
    <div className="hero-banner-container">
      <div className="hero-banner-content"> {/* New div for main content */}
        <p className="beats-solo">{heroBanner.smallText}</p>
        <h3>{heroBanner.midText}</h3>
        <h1>{heroBanner.largeText1}</h1>
        {/* Button and description are part of the content */}
        <div>
          <Link href={`/product/${heroBanner.product}`}>
            <button type="button">{heroBanner.buttonText}</button>
          </Link>
          <div className="desc">
            <h5>Description</h5>
            <p>{heroBanner.desc}</p>
          </div>
        </div>
      </div>
      <div className="hero-banner-image-container"> {/* Image container as a sibling */}
        <Image
          src={urlFor(heroBanner.image).url()}
          alt={heroBanner.product || heroBanner.smallText || 'Hero banner image'}
          width={450} // From CSS
          height={450} // From CSS
          className="hero-banner-image" // This class might need adjustment
          priority // Mark as priority if it's LCP
          // layout="responsive"  // Consider if this is needed instead of fixed width/height
          // objectFit="cover"    // Consider if this is needed
        />
      </div>
    </div>
  );
};

export default HeroBanner;
