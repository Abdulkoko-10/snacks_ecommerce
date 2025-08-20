import React, { useState } from 'react';
import StarRating from './StarRating'; // Assuming StarRating.jsx is in the same directory
import styles from './Reviews.module.css';

const ReviewForm = ({ productId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    user: '',
    rating: 0,
    reviewTitle: '',
    comment: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState({
    loading: false,
    message: '',
    error: false,
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setFormData((prev) => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus({ loading: true, message: '', error: false, success: false });

    // Client-side validation
    if (!formData.user || formData.rating === 0 || !formData.comment) {
      setSubmissionStatus({
        loading: false,
        message: 'Please fill in your name, rating, and comment.',
        error: true,
        success: false,
      });
      return;
    }

    try {
      const response = await fetch('/api/createReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, productId }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus({
          loading: false,
          message: result.message || 'Review submitted successfully and is awaiting approval!',
          error: false,
          success: true,
        });
        setFormData({ user: '', rating: 0, reviewTitle: '', comment: '' }); // Reset form
        if (onSubmitSuccess) {
          onSubmitSuccess(); // Callback for parent component, e.g., to re-fetch reviews
        }
      } else {
        setSubmissionStatus({
          loading: false,
          message: result.message || 'Failed to submit review.',
          error: true,
          success: false,
        });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      setSubmissionStatus({
        loading: false,
        message: 'An unexpected error occurred. Please try again.',
        error: true,
        success: false,
      });
    }
  };

  if (submissionStatus.success) {
    return (
      <div className={styles.review_form_container}>
        <p className={`${styles.submission_message} ${styles.success_message}`}>{submissionStatus.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.review_form_container}>
      <h3 className={styles.review_form_title}>Write a Review</h3>
      
      <div className={styles.form_group}>
        <label htmlFor="userName">Name:</label>
        <input
          type="text"
          id="userName"
          name="user"
          value={formData.user}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className={styles.form_group}>
        <label>Rating:</label>
        <StarRating
          rating={formData.rating}
          onRatingChange={handleRatingChange}
          isInput={true}
          starSize={28}
        />
      </div>

      <div className={styles.form_group}>
        <label htmlFor="reviewTitle">Review Title (Optional):</label>
        <input
          type="text"
          id="reviewTitle"
          name="reviewTitle"
          value={formData.reviewTitle}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.form_group}>
        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          rows="5"
          required
        />
      </div>

      {submissionStatus.message && (
        <p data-testid="submission-message" className={`${styles.submission_message} ${submissionStatus.error ? styles.error_message : ''}`}>
          {submissionStatus.message}
        </p>
      )}

      <button type="submit" className={`btn ${styles.btn_submit_review}`} disabled={submissionStatus.loading}>
        {submissionStatus.loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
