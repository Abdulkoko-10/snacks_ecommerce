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

const ProductDetails = ({ product, products, source }) => {
  // 1. Call ALL hooks unconditionally at the top
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();
  const router = useRouter();
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [isBuyNowFeedback, setIsBuyNowFeedback] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // SWR hook - product._id might be undefined if product is null initially
  // The key is conditional (product?._id), which is correct for SWR.
  const {
    data: currentReviews,
    error: reviewsError,
    isLoading: reviewsLoading,
    mutate: mutateReviews
  } = useSWR(
    product?._id ? ['reviews', product._id] : null,
    fetchReviews,
    { fallbackData: [] }
  );

  // useEffect for logging SWR errors
  useEffect(() => {
    if (reviewsError) {
      console.error('SWR Reviews Fetch Error:', reviewsError);
      // Log additional info if available (SWR errors might have info/status)
      if (reviewsError.info) {
        console.error('SWR Error Info:', reviewsError.info);
      }
      if (reviewsError.status) {
        console.error('SWR Error Status:', reviewsError.status);
      }
    }
  }, [reviewsError]);

  // Log currentReviews when it changes
  useEffect(() => {
    if (product?._id) { // Only log if we expect reviews for a product
      console.log(`[ProductDetails] currentReviews for product ${product._id}:`, currentReviews);
      if (reviewsLoading) {
        console.log(`[ProductDetails] Reviews are currently loading for product ${product._id}.`);
      }
      if (!reviewsLoading && currentReviews) {
        console.log(`[ProductDetails] Received ${currentReviews.length} reviews from SWR for product ${product._id}.`);
      }
    }
  }, [currentReviews, product?._id, reviewsLoading]);

  // 2. Handle loading/not found state for the product *after* all hooks
  if (!product) {
    return <div>Loading product details or product not found...</div>;
  }

  // --- Data Normalization ---
  // Create a normalized product object to handle both data sources seamlessly.
  const isOrchestratorSource = source === 'orchestrator';
  const normalizedProduct = {
    _id: isOrchestratorSource ? product.canonicalProductId : product._id,
    name: isOrchestratorSource ? product.preview.title : product.name,
    details: isOrchestratorSource ? product.preview.details : product.details,
    price: isOrchestratorSource ? product.preview.minPrice : product.price,
    image: isOrchestratorSource ? [product.preview.image] : product.image, // Creates an array with a single URL string if from orchestrator
    slug: isOrchestratorSource ? { current: product.preview.slug } : product.slug,
  };

  // 3. Safe destructuring now that product is confirmed to exist
  const { _id, image, name, details, price, slug } = normalizedProduct;

  // Event handlers and other logic that depend on product properties
  const handleAddToCartWithFeedback = () => {
    onAdd(normalizedProduct, qty);
    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    onAdd(normalizedProduct, qty);
    setIsBuyNowFeedback(true);
    setTimeout(() => {
      setIsBuyNowFeedback(false);
      setShowCart(true);
    }, 1000);
  };

  const aggregateRating = currentReviews.reduce(
    (acc, review) => {
      acc.totalRating += review.rating;
      acc.count += 1;
      return acc;
    },
    { totalRating: 0, count: 0 }
  );

  const averageRating = aggregateRating.count > 0 ? aggregateRating.totalRating / aggregateRating.count : 0;

  // Basic handler for when a review is submitted.
  // In a real app, you might want to re-fetch reviews or optimistically update the list.
  const handleReviewSubmitSuccess = async () => {
    setShowReviewForm(false); // Optionally hide form
    // After successful review submission via API (not shown here, but assumed)
    // Trigger SWR to re-fetch reviews
    await mutateReviews();
    // No need for: const updatedReviews = await client.fetch...
    // No need for: setCurrentReviews(updatedReviews);
    // Could also add a "Thank you for your review, it's awaiting approval" message.
  };

  // Construct JSON-LD data
  const siteBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://yourwebsite.com'; // Fallback, replace with actual env var if possible
  
  const currentProductUrl = `${siteBaseUrl}${router.asPath}`;

  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": image ? image.map(img => urlFor(img).url()) : [],
    "description": details,
    "sku": _id, // Using Sanity document ID as SKU
    "brand": {
      "@type": "Brand",
      "name": "SnacksCo" // Static brand name for now
    },
    "offers": {
      "@type": "Offer",
      "url": currentProductUrl,
      "priceCurrency": "NGN", // Assuming NGN based on price format "N{price}"
      "price": price.toString(), // Ensure price is a string
      "availability": "https://schema.org/InStock", // Assuming all products are InStock
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": aggregateRating.count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1), // Format to one decimal place
      "reviewCount": aggregateRating.count
    } : undefined, // Omit aggregateRating if no reviews
    "review": currentReviews.map(review => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": review.user || "Anonymous" },
      "datePublished": review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString() // Ensure ratingValue is a string
      },
      "name": review.reviewTitle || `Review for ${name}`, // Fallback review title
      "description": review.comment
    }))
  };
  // Remove aggregateRating if not applicable
  if (!jsonLdData.aggregateRating) {
    delete jsonLdData.aggregateRating;
  }
  // Remove review array if empty, as per some validators' preferences
  if (jsonLdData.review && jsonLdData.review.length === 0) {
    delete jsonLdData.review;
  }


  return (
    <div>
      <Head>
        <title>{`${name} - SnacksCo`}</title>
        <meta name="description" content={details} />
        {/* Add other meta tags as needed */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>
      <div className="product-detail-container">
        <div>
          <div className="image-container">
            {image && image[index] && (
              <Image
                // If the image item is a string, use it directly. Otherwise, use urlFor.
                src={typeof image[index] === 'string' ? image[index] : urlFor(image[index]).url()}
                alt={name}
                width={400}
                height={400}
                className="product-detail-image"
                priority
              />
            )}
          </div>
          <div className="small-images-container">
            {image?.map((item, i) => (
              item && (
                <Image
                  key={i}
                  src={typeof item === 'string' ? item : urlFor(item).url()}
                  alt={`${name} - view ${i + 1}`}
                  width={70}
                  height={70}
                  className={
                    i === index ? "small-image selected-image" : "small-image"
                  }
                  onMouseEnter={() => setIndex(i)}
                />
              )
            ))}
          </div>
        </div>

        <div className="product-detail-desc">
          <h1>{name}</h1>
          <div className="reviews">
            {reviewsLoading && <p>Loading reviews...</p>}
            {reviewsError && <p>Error loading reviews.</p>}
            {!reviewsLoading && !reviewsError && (
              aggregateRating.count > 0 ? (
                <>
                  <StarRating rating={averageRating} starSize={20} />
                  <p>({aggregateRating.count} {aggregateRating.count === 1 ? 'Review' : 'Reviews'})</p>
                </>
              ) : (
                <p>(No reviews yet)</p>
              )
            )}
          </div>
          <h4>Details: </h4>
          <p>{details}</p>
          <p className="price">N{price}</p>
          <div className="quantity">
            <h3>Quantity: </h3>
            <p className="quantity-desc">
              <span className="minus" onClick={decQty}>
                <AiOutlineMinus />
              </span>
              <span className="num">{qty}</span>
              <span className="plus" onClick={incQty}>
                <AiOutlinePlus />
              </span>
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
        <DynamicReviewList reviews={currentReviews} />
        <button 
          type="button" 
          className="btn btn-toggle-review-form" 
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          {showReviewForm ? 'Cancel Review' : 'Write a Review'}
        </button>
        {showReviewForm && (
          <DynamicReviewForm
            productId={product._id} 
            onSubmitSuccess={handleReviewSubmitSuccess} 
          />
        )}
      </div>

      {/* "You may also like" section now dynamically imported */}
      <DynamicMayLikeProducts products={products} />
    </div>
  );
};

export const getStaticPaths = async () => {
  const query = `*[_type == "product"] {
    slug {
      current
    }
  }`;

  const products = await previewClient.fetch(query);

  const paths = products.map((product) => ({
    params: {
      slug: product.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};

// Export a constant named getStaticProps that is an async function
// which takes in an object containing a property of 'params' with a property of 'slug'
export const getStaticProps = async ({ params: { slug } }) => {
  const useOrchestrator = isOrchestratorEnabled();
  let product;
  let source;

  if (useOrchestrator) {
    console.log(`Using Orchestrator to fetch product: ${slug}`);
    source = 'orchestrator';
    try {
      const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';
      const response = await fetch(`${orchestratorUrl}/api/v1/product/${slug}`);
      if (response.ok) {
        product = await response.json();
      } else {
        product = null;
      }
    } catch (e) {
      console.error(`Could not fetch from orchestrator for slug ${slug}, falling back to Sanity.`, e);
      product = null;
    }
  }

  // Fallback to Sanity if orchestrator is disabled or fails
  if (!product) {
    console.log(`Using Sanity to fetch product: ${slug}`);
    source = 'sanity';
    const query = `*[_type == "product" && slug.current == '${slug}'][0]`;
    product = await previewClient.fetch(query);
  }

  // Fetch "You may also like" products
  let products = [];
  if (product) {
    const currentProductId = isOrchestratorEnabled() ? (product.canonicalProductId || product._id) : product._id;
    const productsQuery = `*[_type == "product" && _id != $currentProductId] | order(_createdAt desc) [0...4]`;
    products = await previewClient.fetch(productsQuery, { currentProductId });
  } else {
    const productsQuery = `*[_type == "product"] | order(_createdAt desc) [0...4]`;
    products = await previewClient.fetch(productsQuery);
  }

  return {
    props: { product, products, source },
    revalidate: 60,
  };
};

export default ProductDetails;
