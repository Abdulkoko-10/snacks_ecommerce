import React from "react";
import Link from "next/link";
import Image from 'next/image';

import { urlFor } from "../lib/client";

const HeroBanner = ({ heroBanner }) => {
  return (
    <div className="hero-banner-container glassmorphism">
      <div>
        <p className="beats-solo">{heroBanner.smallText}</p>
        <h3>{heroBanner.midText}</h3>
        <h1>{heroBanner.largeText1}</h1>
        <div className="hero-banner-image-container"> {/* Optional container for positioning context */}
          <Image
            src={urlFor(heroBanner.image).url()}
            alt={heroBanner.product || heroBanner.smallText || 'Hero banner image'}
            width={450} // From CSS
            height={450} // From CSS
            className="hero-banner-image" // This class might need adjustment
            priority // Mark as priority if it's LCP
            layout="intrinsic"
            objectFit="cover"
          />
        </div>

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
    </div>
  );
};

export default HeroBanner;
