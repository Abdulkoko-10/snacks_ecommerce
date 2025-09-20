import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";

import { urlFor, previewClient } from "../../lib/client"; // Keep previewClient for reviews for now
import { getProducts, getProductBySlug } from "../../lib/data-access"; // NEW: Import data access functions
import Product from "../../components/Product";
import { useStateContext } from "../../context/StateContext";
import StarRating from '../../components/StarRating';
import dynamic from 'next/dynamic';

const DynamicReviewList = dynamic(() => import('../../components/ReviewList'), {
  ssr: false,
});
const DynamicReviewForm = dynamic(() => import('../../components/ReviewForm'), {
  ssr: false,
});

const DynamicMayLikeProducts = dynamic(() => import('../../components/MayLikeProducts'), {
  ssr: false,
});

import useSWR from 'swr';

// Fetcher function for SWR (for reviews, still from Sanity)
const fetchReviews = async (keyWithProductId) => {
  const productId = keyWithProductId[1];
  if (!productId) return [];
  const reviewsQuery = `*[_type == "review" && product._ref == $productId && approved == true] | order(createdAt desc)`;
  try {
    const reviews = await previewClient.fetch(reviewsQuery, { productId });
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for productId ${productId}:`, error);
    throw error;
  }
};

const ProductDetails = ({ product, products }) => {
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();
  const router = useRouter();
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [isBuyNowFeedback, setIsBuyNowFeedback] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // SWR hook for reviews (still from Sanity)
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

  if (router.isFallback || !product) {
    return <div>Loading product details or product not found...</div>;
  }

  const { _id, image, name, details, price, slug } = product;

  const handleAddToCartWithFeedback = () => {
    onAdd(product, qty);
    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    onAdd(product, qty);
    setIsBuyNowFeedback(true);
    setTimeout(() => {
      setIsBuyNowFeedback(false);
      setShowCart(true);
    }, 1000);
  };

  const aggregateRating = (currentReviews || []).reduce(
    (acc, review) => {
      acc.totalRating += review.rating;
      acc.count += 1;
      return acc;
    },
    { totalRating: 0, count: 0 }
  );

  const averageRating = aggregateRating.count > 0 ? aggregateRating.totalRating / aggregateRating.count : 0;

  const handleReviewSubmitSuccess = async () => {
    setShowReviewForm(false);
    await mutateReviews();
  };

  const siteBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://yourwebsite.com';
  
  const currentProductUrl = `${siteBaseUrl}${router.asPath}`;

  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": image ? image.map(img => urlFor(img).url()) : [],
    "description": details,
    "sku": _id,
    "brand": { "@type": "Brand", "name": "SnacksCo" },
    "offers": {
      "@type": "Offer",
      "url": currentProductUrl,
      "priceCurrency": "NGN",
      "price": price.toString(),
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
  };

  return (
    <div>
      <Head>
        <title>{`${name} - SnacksCo`}</title>
        <meta name="description" content={details} />
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
                // NOTE: urlFor will not work if `image` is not a Sanity image object.
                // This will need to be addressed if image sources change.
                // For now, assuming the seeded data structure is compatible.
                src={image[index]?.asset?._ref ? urlFor(image[index]).url() : '/placeholder.png'}
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
              item?.asset?._ref && (
                <Image
                  key={i}
                  src={urlFor(item).url()}
                  alt={`${name} - view ${i + 1}`}
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
              <span className="minus" onClick={decQty}><AiOutlineMinus /></span>
              <span className="num">{qty}</span>
              <span className="plus" onClick={incQty}><AiOutlinePlus /></span>
            </p>
          </div>
          <div className="buttons">
            <button type="button" className={`add-to-cart ${isAddedFeedback ? 'added-feedback' : ''}`} onClick={handleAddToCartWithFeedback} disabled={isAddedFeedback}>
              {isAddedFeedback ? "✓ Added!" : "Add to Cart"}
            </button>
            <button type="button" className={`buy-now ${isBuyNowFeedback ? 'added-feedback' : ''}`} onClick={handleBuyNow} disabled={isBuyNowFeedback}>
              {isBuyNowFeedback ? "✓ Adding..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <DynamicReviewList reviews={currentReviews} />
        <button type="button" className="btn btn-toggle-review-form" onClick={() => setShowReviewForm(!showReviewForm)}>
          {showReviewForm ? 'Cancel Review' : 'Write a Review'}
        </button>
        {showReviewForm && (
          <DynamicReviewForm productId={product._id} onSubmitSuccess={handleReviewSubmitSuccess} />
        )}
      </div>

      <DynamicMayLikeProducts products={products} />
    </div>
  );
};

export const getStaticPaths = async () => {
  const products = await getProducts(); // Fetch all products from MongoDB
  const paths = products
    .filter(p => p.slug && p.slug.current) // Ensure slug exists
    .map((product) => ({
      params: {
        slug: product.slug.current,
      },
    }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params: { slug } }) => {
  // Fetch the specific product from MongoDB by its slug
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      notFound: true,
    };
  }

  // Fetch other products for the "You may also like" section, excluding the current one.
  const allProducts = await getProducts();
  const products = allProducts.filter(p => p.slug.current !== slug).slice(0, 4);

  return {
    props: { product, products },
    revalidate: 60,
  };
};

export default ProductDetails;
