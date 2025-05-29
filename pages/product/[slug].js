import React, { useState } from "react";
import Head from 'next/head'; // Import Head
import { useRouter } from 'next/router'; // To get current path for URL

import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";

import { client, urlFor } from "../../lib/client";
//import Image from 'next/image'; // Ensure Image is imported
import Product from "../../components/Product";
import { useStateContext } from "../../context/StateContext";
import StarRating from '../../components/StarRating'; // Import StarRating
import ReviewList from '../../components/ReviewList';   // Import ReviewList
import ReviewForm from '../../components/ReviewForm';   // Import ReviewForm

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const ProductDetails = ({ product, products, reviews: initialReviews }) => {
  const { _id, image, name, details, price, slug } = product; // Added _id and slug for SKU and URL
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();
  const router = useRouter(); // For constructing current page URL

  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [isBuyNowFeedback, setIsBuyNowFeedback] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentReviews, setCurrentReviews] = useState(initialReviews || []);


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
    // Re-fetch reviews (simple approach)
    const reviewsQuery = `*[_type == "review" && product._ref == "${product._id}" && approved == true] | order(createdAt desc)`;
    const updatedReviews = await client.fetch(reviewsQuery);
    setCurrentReviews(updatedReviews);
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
            {image && image[index] && ( // Check if image and image[index] exist
              <img
                src={urlFor(image[index]).url()}
                alt={name}
                width={400} // From CSS .product-detail-image
                height={400} // From CSS .product-detail-image
                className="product-detail-image"
                priority // Main product image, likely LCP
              />
            )}
          </div>
          <div className="small-images-container">
            {image?.map((item, i) => (
              item && ( // Ensure item exists before rendering Image
                <img
                  key={i}
                  src={urlFor(item).url()}
                  alt={`${name} - view ${i + 1}`}
                  width={70} // From CSS .small-image
                  height={70} // From CSS .small-image
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
            {aggregateRating.count > 0 ? (
              <>
                <StarRating rating={averageRating} starSize={20} />
                <p>({aggregateRating.count} {aggregateRating.count === 1 ? 'Review' : 'Reviews'})</p>
              </>
            ) : (
              <p>(No reviews yet)</p>
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
        <ReviewList reviews={currentReviews} />
        <button 
          type="button" 
          className="btn btn-toggle-review-form" 
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          {showReviewForm ? 'Cancel Review' : 'Write a Review'}
        </button>
        {showReviewForm && (
          <ReviewForm 
            productId={product._id} 
            onSubmitSuccess={handleReviewSubmitSuccess} 
          />
        )}
      </div>

      <div className="maylike-products-wrapper">
        <h2>You may also like</h2>
        <Swiper
          className="you-may-also-like-swiper"
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={10} // Default spaceBetween, overridden by breakpoints
          slidesPerView={1} // Default slidesPerView, overridden by breakpoints
          navigation
          pagination={{ clickable: true }}
          loop={true}
          breakpoints={{
            // when window width is >= 320px
            320: { slidesPerView: 1, spaceBetween: 10 },
            // when window width is >= 480px
            480: { slidesPerView: 2, spaceBetween: 15 },
            // when window width is >= 768px
            768: { slidesPerView: 3, spaceBetween: 20 },
            // when window width is >= 1024px
            1024: { slidesPerView: 4, spaceBetween: 25 },
          }}
        >
          {products?.map((item) => (
            <SwiperSlide key={item._id}>
              <Product product={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export const getStaticPaths = async () => {
  const query = `*[_type == "product"] {
    slug {
      current
    }
  }`;

  const products = await client.fetch(query);

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
  // Create a query for the product with the given slug
  const query = `*[_type == "product" && slug.
  current == '${slug}'][0]`;
  const productsQuery = `*[_type == "product"]`;
  
  // Query for approved reviews for this product
  const reviewsQuery = `*[_type == "review" && product._ref == ^._id && approved == true] | order(createdAt desc)`;

  // Fetch the product with the given slug
  // We need to fetch the product first to get its _id for the reviewsQuery
  const product = await client.fetch(query);

  let reviews = [];
  if (product && product._id) {
    // Now fetch reviews using the product's _id
    // The `^._id` in reviewsQuery refers to the _id of the document being joined from, which is product here.
    // To make it work directly, we inject productId.
    const reviewsDataQuery = `*[_type == "review" && product._ref == "${product._id}" && approved == true] | order(createdAt desc)`;
    reviews = await client.fetch(reviewsDataQuery);
  }
  
  // Fetch all products (for "You may also like" section)
  const products = await client.fetch(productsQuery);

  return {
    props: { products, product, reviews },
    revalidate: 60, // Optionally, add revalidation if using ISR
  };
};

export default ProductDetails;
