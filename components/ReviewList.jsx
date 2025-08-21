import React from 'react';
import StarRating from './StarRating'; // Assuming StarRating.jsx is in the same directory
import '../styles/components/reviews.css';

const ReviewList = ({ reviews = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (reviews.length === 0) {
    return <p className="no-reviews-message">No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="review-list-container">
      <h3 className="review-list-title">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id || review.createdAt} className="review-item">
          <div className="review-item-header">
            <span className="review-user">{review.user || 'Anonymous'}</span>
            <span className="review-date">{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} starSize={20} />
          {review.reviewTitle && <h4 className="review-title">{review.reviewTitle}</h4>}
          <p className="review-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
