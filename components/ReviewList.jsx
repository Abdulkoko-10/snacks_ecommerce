import React from 'react';
import StarRating from './StarRating'; // Assuming StarRating.jsx is in the same directory
import styles from './Reviews.module.css';

const ReviewList = ({ reviews = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (reviews.length === 0) {
    return <p className={styles.no_reviews_message}>No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className={styles.review_list_container}>
      <h3 className={styles.review_list_title}>Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id || review.createdAt} className={styles.review_item}>
          <div className={styles.review_item_header}>
            <span className={styles.review_user}>{review.user || 'Anonymous'}</span>
            <span className={styles.review_date}>{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} starSize={20} />
          {review.reviewTitle && <h4 className={styles.review_title}>{review.reviewTitle}</h4>}
          <p className={styles.review_comment}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
