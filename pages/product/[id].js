import React, { useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import Image from 'next/image';

// This is a simplified details page for displaying restaurant info from the API.
// It does not use the e-commerce context (useStateContext).
const ProductDetails = ({ product }) => {
    const [index, setIndex] = useState(0);

    // This provides a basic loading state while the data is being fetched.
    if (!product) {
        return <div>Loading...</div>;
    }

    const { name, address, rating, photos, user_reviews, website, phone_number } = product;

    // Use the first photo as the main image, or a placeholder if no photos exist.
    const mainPhoto = (photos && photos.length > 0) ? photos[index] : "/FoodDiscovery.jpg";

    return (
        <div>
            <div className="product-detail-container">
                <div>
                    <div className="image-container">
                        <Image
                            src={mainPhoto}
                            width={400}
                            height={400}
                            alt={name || 'Restaurant Image'}
                            className="product-detail-image"
                            unoptimized // Necessary for external image URLs from APIs like SerpApi
                        />
                    </div>
                    <div className="small-images-container">
                        {photos?.slice(0, 5).map((photoUrl, i) => (
                            <Image
                                key={i}
                                src={photoUrl}
                                width={70}
                                height={70}
                                alt={`${name} thumbnail ${i + 1}`}
                                className={i === index ? 'small-image selected-image' : 'small-image'}
                                onMouseEnter={() => setIndex(i)}
                                unoptimized
                            />
                        ))}
                    </div>
                </div>

                <div className="product-detail-desc">
                    <h1>{name}</h1>
                    {rating && (
                        <div className="reviews">
                            <div>
                                {[...Array(5)].map((_, i) => (
                                    i < Math.round(rating) ? <AiFillStar key={i} /> : <AiOutlineStar key={i} />
                                ))}
                            </div>
                            <p>({rating.toFixed(1)})</p>
                        </div>
                    )}
                    <h4>Address:</h4>
                    <p>{address}</p>

                    {phone_number && (<><h4>Phone:</h4><p>{phone_number}</p></>)}
                    {website && (<><h4>Website:</h4><p><a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p></>)}

                    {/* The Add to Cart, Buy Now, and Quantity buttons have been removed
                        as they are part of the e-commerce flow and do not apply here. */}
                </div>
            </div>

            {user_reviews && user_reviews.length > 0 && (
                <div className="maylike-products-wrapper reviews-section">
                    <h2 className="review-list-title">Reviews</h2>
                    <div className="review-list-container">
                        {user_reviews.map((review, i) => (
                            <div key={i} className="review-item">
                                <div className="review-item-header">
                                    <span className="review-user">{review.user?.name || "A visitor"}</span>
                                    {review.rating && (
                                        <div className="star-rating">
                                            {[...Array(5)].map((_, j) => (
                                                j < Math.round(review.rating) ? <AiFillStar key={j} /> : <AiOutlineStar key={j} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="review-comment">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Replaced getStaticProps with getServerSideProps for dynamic data fetching
export const getServerSideProps = async ({ params: { id } }) => {
    // Determine the base URL for the API call
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${baseUrl}/api/v1/product/${id}`);

        if (!res.ok) {
            // If the API returns an error (e.g., 404, 500), render the 404 page.
            return { notFound: true };
        }

        const product = await res.json();

        return {
            props: { product }
        }
    } catch (error) {
        console.error("Failed to fetch product details:", error);
        // In case of a network error, also render the 404 page.
        return { notFound: true };
    }
}

export default ProductDetails;
