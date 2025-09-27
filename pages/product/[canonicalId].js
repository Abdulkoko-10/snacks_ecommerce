import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { readClient, urlFor, previewClient } from "../../lib/client";
import { useStateContext } from "../../context/StateContext";
import StarRating from '../../components/StarRating';
import dynamic from 'next/dynamic';
import useSWR from 'swr';

const DynamicMayLikeProducts = dynamic(() => import('../../components/MayLikeProducts'), {
  ssr: false,
});

// Fetcher function for SWR (for client-side review fetching)
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

  const { data: currentReviews, error: reviewsError } = useSWR(
    product?.canonicalProductId ? ['reviews', product.canonicalProductId] : null,
    fetchReviews,
    { fallbackData: [] }
  );

  useEffect(() => {
    if (reviewsError) console.error('SWR Reviews Fetch Error:', reviewsError);
  }, [reviewsError]);

  if (!product) {
    return <div>Product not found.</div>;
  }

  const {
    canonicalProductId,
    title,
    images,
    description,
    price,
    rating,
    numRatings,
  } = product;

  const handleBuyNow = () => {
    onAdd(product, qty);
    setShowCart(true);
  };

  const siteBaseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://yourwebsite.com';
  const currentProductUrl = `${siteBaseUrl}${router.asPath}`;

  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": title,
    "image": images || [],
    "description": description,
    "sku": canonicalProductId,
    "brand": { "@type": "Brand", "name": "SnacksCo" },
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
            <button type="button" className="add-to-cart" onClick={() => onAdd(product, qty)}>Add to Cart</button>
            <button type="button" className="buy-now" onClick={handleBuyNow}>Buy Now</button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <p>(Review functionality is being updated)</p>
      </div>

      <DynamicMayLikeProducts products={products} />
    </div>
  );
};

export const getStaticPaths = async () => {
  const query = `*[_type == "product"]{_id}`;
  const sanityProducts = await previewClient.fetch(query);
  const paths = sanityProducts.map((p) => ({
    params: { canonicalId: `sanity::${p._id}` },
  }));
  return { paths, fallback: "blocking" };
};

const getOrchestratorUrl = () => {
  if (process.env.ORCHESTRATOR_URL) return process.env.ORCHESTRATOR_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const getStaticProps = async ({ params: { canonicalId } }) => {
  let product = null;
  let similarProducts = [];

  try {
    const orchestratorUrl = getOrchestratorUrl();
    const response = await fetch(`${orchestratorUrl}/api/v1/product/${canonicalId}`);
    if (response.ok) {
      product = await response.json();
    } else {
      console.error(`Failed to fetch product ${canonicalId}. Status: ${response.status}`);
    }
  } catch (e) {
    console.error(`Error fetching product ${canonicalId} from orchestrator:`, e);
  }

  try {
    const productsQuery = `*[_type == "product"] | order(_createdAt desc) [0...4]`;
    similarProducts = await previewClient.fetch(productsQuery);
  } catch (e) {
    console.error('Failed to fetch similar products from Sanity:', e);
  }

  return {
    props: { product, products: similarProducts },
    revalidate: 60,
  };
};

export default ProductDetails;