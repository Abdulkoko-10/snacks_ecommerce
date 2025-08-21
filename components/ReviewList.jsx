import React from 'react';
import StarRating from './StarRating'; // Assuming StarRating.jsx is in the same directory
import styles from '../styles/components/reviews.module.css';

const ReviewList = ({ reviews = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (reviews.length === 0) {
    return <p className={styles.noReviewsMessage}>No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className={styles.reviewListContainer}>
      <h3 className={styles.reviewListTitle}>Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id || review.createdAt} className={styles.reviewItem}>
          <div className={styles.reviewItemHeader}>
            <span className={styles.reviewUser}>{review.user || 'Anonymous'}</span>
            <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} starSize={20} />
          {review.reviewTitle && <h4 className={styles.reviewTitle}>{review.reviewTitle}</h4>}
          <p className={styles.reviewComment}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
