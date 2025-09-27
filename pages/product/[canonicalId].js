import React, { useState, useEffect } from "react";
import Head from 'next/head'; // Import Head
import { useRouter } from 'next/router'; // To get current path for URL
import Image from 'next/image'; // Ensure Image is imported

import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";

import { isOrchestratorEnabled } from "../../lib/flags";
import { readClient, urlFor, previewClient } from "../../lib/client";
import Product from "../../components/Product";
import { useStateContext } from "../../context/StateContext";
import StarRating from '../../components/StarRating'; // Import StarRating
// import ReviewList from '../../components/ReviewList';   // Static import removed
// import ReviewForm from '../../components/ReviewForm';   // Static import removed
import dynamic from 'next/dynamic';

const DynamicReviewList = dynamic(() => import('../../components/ReviewList'), {
  ssr: false,
});
const DynamicReviewForm = dynamic(() => import('../../components/ReviewForm'), {
  ssr: false,
});

const DynamicMayLikeProducts = dynamic(() => import('../../components/MayLikeProducts'), {
  ssr: false,
  // Optional: loading: () => <p>Loading suggestions...</p>
});

// Swiper imports (REMOVED - now in MayLikeProducts.jsx)
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation, Pagination, A11y } from 'swiper/modules';

// Import Swiper styles (REMOVED - now in MayLikeProducts.jsx)
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
import useSWR from 'swr';

// Fetcher function for SWR
const fetchReviews = async (keyWithProductId) => {
  const productId = keyWithProductId[1]; // Extract productId from the key array
  console.log(`[fetchReviews] Fetching reviews for productId: ${productId}`);

  if (!productId) {
    console.warn('[fetchReviews] No productId provided.');
    return []; // Or throw an error if preferred
  }

  const reviewsQuery = `*[_type == "review" && product._ref == $productId && approved == true] | order(createdAt desc)`;
  try {
    const reviews = await previewClient.fetch(reviewsQuery, { productId });
    console.log(`[fetchReviews] Found ${reviews.length} approved reviews for productId: ${productId}.`);
    // console.log(`[fetchReviews] Data for ${productId}:`, reviews); // Optional: log full data
    return reviews;
  } catch (error) {
    console.error(`[fetchReviews] Error fetching reviews for productId ${productId}:`, error);
    throw error; // Re-throw error so SWR can catch it
  }
};

const ProductDetails = ({ product, products }) => {
  // 1. Call ALL hooks unconditionally at the top
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();
  const router = useRouter();
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [isBuyNowFeedback, setIsBuyNowFeedback] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // SWR hook for reviews. The key is now the canonicalProductId.
  const {
    data: currentReviews,
    error: reviewsError,
    isLoading: reviewsLoading,
    mutate: mutateReviews
  } = useSWR(
    product?.canonicalProductId ? ['reviews', product.canonicalProductId] : null,
    fetchReviews,
    { fallbackData: [] }
  );

  useEffect(() => {
    if (reviewsError) console.error('SWR Reviews Fetch Error:', reviewsError);
  }, [reviewsError]);

  // 2. Handle loading/not found state for the product *after* all hooks
  if (!product) {
    return <div>Loading product details or product not found...</div>;
  }

  // 3. Destructure directly from the CanonicalProduct prop. No normalization needed.
  const {
    canonicalProductId,
    title,
    images,
    description,
    price,
    rating,
    numRatings,
  } = product;

  // Event handlers and other logic
  const handleAddToCartWithFeedback = () => {
    onAdd(product, qty);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    onAdd(product, qty);
    setIsBuyNowFeedback(true);
    setTimeout(() => {
      setIsBuyNowFeedback(false);
      setShowCart(true);
    }, 1000);
  };

  const handleReviewSubmitSuccess = async () => {
    setShowReviewForm(false);
    await mutateReviews();
  };

  // Construct JSON-LD data
  const siteBaseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://yourwebsite.com'; // Fallback
  const currentProductUrl = `${siteBaseUrl}${router.asPath}`;

  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": title,
    "image": images || [],
    "description": description,
    "sku": canonicalProductId,
    "brand": {
      "@type": "Brand",
      "name": "SnacksCo"
    },
    "offers": {
      "@type": "Offer",
      "url": currentProductUrl,
      "priceCurrency": price?.currency || 'USD',
      "price": price?.amount?.toString(),
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": numRatings > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": rating.toFixed(1),
      "reviewCount": numRatings
    } : undefined,
  };
  if (!jsonLdData.aggregateRating) delete jsonLdData.aggregateRating;

  return (
    <div>
      <Head>
        <title>{`${title} - SnacksCo`}</title>
        <meta name="description" content={description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>
      <div className="product-detail-container">
        <div>
          <div className="image-container">
            {images && images[index] && (
              <Image
                src={images[index]}
                alt={title}
                width={400}
                height={400}
                className="product-detail-image"
                priority
              />
            )}
          </div>
          <div className="small-images-container">
            {images?.map((item, i) => (
              item && (
                <Image
                  key={i}
                  src={item}
                  alt={`${title} - view ${i + 1}`}
                  width={70}
                  height={70}
                  className={i === index ? "small-image selected-image" : "small-image"}
                  onMouseEnter={() => setIndex(i)}
                />
              )
            ))}
          </div>
        </div>

        <div className="product-detail-desc">
          <h1>{title}</h1>
          <div className="reviews">
            <StarRating rating={rating} starSize={20} />
            <p>({numRatings} {numRatings === 1 ? 'Review' : 'Reviews'})</p>
          </div>
          <h4>Details: </h4>
          <p>{description}</p>
          <p className="price">N{price?.amount}</p>
          <div className="quantity">
            <h3>Quantity: </h3>
            <p className="quantity-desc">
              <span className="minus" onClick={decQty}><AiOutlineMinus /></span>
              <span className="num">{qty}</span>
              <span className="plus" onClick={incQty}><AiOutlinePlus /></span>
            </p>
          </div>
          <div className="buttons">
            <button
              type="button"
              className={`add-to-cart ${isAddedFeedback ? 'added-feedback' : ''}`}
              onClick={handleAddToCartWithFeedback}
              disabled={isAddedFeedback}
            >
              {isAddedFeedback ? "✓ Added!" : "Add to Cart"}
            </button>
            <button
              type="button"
              className={`buy-now ${isBuyNowFeedback ? 'added-feedback' : ''}`}
              onClick={handleBuyNow}
              disabled={isBuyNowFeedback}
            >
              {isBuyNowFeedback ? "✓ Adding..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        {/* The review components would need to be updated to work with canonical IDs */}
        <p>(Review functionality is being updated)</p>
      </div>

      <DynamicMayLikeProducts products={products} />
    </div>
  );
};

export const getStaticPaths = async () => {
  // Fetch all product IDs from Sanity to generate static paths.
  // In a real-world scenario with many products, this might be an endpoint
  // on the orchestrator that returns all canonical IDs.
  const query = `*[_type == "product"]{_id}`;
  const sanityProducts = await previewClient.fetch(query);

  const paths = sanityProducts.map((p) => ({
    params: {
      canonicalId: `sanity::${p._id}`,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params: { canonicalId } }) => {
  const useOrchestrator = isOrchestratorEnabled();
  let product;

  if (useOrchestrator) {
    console.log(`Using Orchestrator to fetch product: ${canonicalId}`);
    try {
      const orchestratorUrl = process.env.ORCHESTRATOR_URL;
      if (orchestratorUrl) {
        const response = await fetch(`${orchestratorUrl}/api/v1/product/${canonicalId}`);
        if (response.ok) {
          product = await response.json();
        } else {
          product = null;
        }
      } else {
        console.warn('ORCHESTRATOR_URL is not defined. Skipping orchestrator fetch.');
        product = null;
      }
    } catch (e) {
      console.error(`Could not fetch from orchestrator for id ${canonicalId}, falling back to Sanity.`, e);
      product = null;
    }
  }

  // Fallback to Sanity if orchestrator is disabled or fails
  if (!product) {
    console.log(`Using Sanity as fallback to fetch product: ${canonicalId}`);
    // Parse the sanity ID from the canonicalId
    const sanityId = canonicalId.split('::')[1];
    if (sanityId) {
      const query = `*[_type == "product" && _id == '${sanityId}'][0]`;
      const sanityProduct = await previewClient.fetch(query);
      // Manually transform to CanonicalProduct to ensure consistent data structure
      if (sanityProduct) {
        product = {
          canonicalProductId: `sanity::${sanityProduct._id}`,
          title: sanityProduct.name,
          images: sanityProduct.image ? sanityProduct.image.map(img => urlFor(img).width(400).url()) : ['/default-product-image.png'],
          description: sanityProduct.details,
          price: { amount: sanityProduct.price, currency: 'USD' },
          rating: 0, numRatings: 0, tags: [],
          sources: [{ provider: 'sanity', providerProductId: sanityProduct._id, price: sanityProduct.price, lastFetchedAt: new Date().toISOString() }],
          comments: [], popularityScore: 0,
          lastFetchedAt: new Date().toISOString(),
        };
      } else {
        product = null;
      }
    } catch (e) {
      console.error(`Could not fetch from orchestrator for id ${canonicalId}, falling back to Sanity.`, e);
      product = null;
    }
  }

  // Fallback to Sanity if orchestrator is disabled or fails
  if (!product) {
    console.log(`Using Sanity as fallback to fetch product: ${canonicalId}`);
    // Parse the sanity ID from the canonicalId
    const sanityId = canonicalId.split('::')[1];
    if (sanityId) {
      const query = `*[_type == "product" && _id == '${sanityId}'][0]`;
      const sanityProduct = await previewClient.fetch(query);
      // Manually transform to CanonicalProduct to ensure consistent data structure
      if (sanityProduct) {
        product = {
          canonicalProductId: `sanity::${sanityProduct._id}`,
          title: sanityProduct.name,
          images: sanityProduct.image ? sanityProduct.image.map(img => urlFor(img).width(400).url()) : ['/default-product-image.png'],
          description: sanityProduct.details,
          price: { amount: sanityProduct.price, currency: 'USD' },
          rating: 0, numRatings: 0, tags: [],
          sources: [{ provider: 'sanity', providerProductId: sanityProduct._id, price: sanityProduct.price, lastFetchedAt: new Date().toISOString() }],
          comments: [], popularityScore: 0,
          lastFetchedAt: new Date().toISOString(),
        };
      }
    }
  }

  // Fetch "You may also like" products (still from Sanity for now)
  const productsQuery = `*[_type == "product"] | order(_createdAt desc) [0...4]`;
  const similarProducts = await previewClient.fetch(productsQuery);

  return {
    props: { product, products: similarProducts },
    revalidate: 60,
  };
};

export default ProductDetails;
