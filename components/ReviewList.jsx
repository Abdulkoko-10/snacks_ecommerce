import React, { useState } from 'react';
import StarRating from './StarRating';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const ReviewList = ({ reviews = [], mutateReviews }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleLike = async (reviewId) => {
    await fetch(`/api/reviews/${reviewId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: true }),
    });
    mutateReviews();
  };

  const handleDislike = async (reviewId) => {
    await fetch(`/api/reviews/${reviewId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: false }),
    });
    mutateReviews();
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyContent.trim()) return;
    await fetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'Anonymous', comment: replyContent }), // Replace 'Anonymous' with actual user if available
    });
    setReplyingTo(null);
    setReplyContent('');
    mutateReviews();
  };

  if (reviews.length === 0) {
    return <p className="no-reviews-message">No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="review-list-container">
      <h3 className="review-list-title">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id} className="review-item">
          <div className="review-item-header">
            <span className="review-user">{review.user || 'Anonymous'}</span>
            <span className="review-date">{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} starSize={20} />
          {review.reviewTitle && <h4 className="review-title">{review.reviewTitle}</h4>}
          <p className="review-comment">{review.comment}</p>

          <div className="review-actions">
            <button onClick={() => handleLike(review._id)} className="like-btn">
              <FaThumbsUp /> ({review.likes || 0})
            </button>
            <button onClick={() => handleDislike(review._id)} className="dislike-btn">
              <FaThumbsDown /> ({review.dislikes || 0})
            </button>
            <button onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)} className="reply-btn">
              Reply
            </button>
          </div>

          {review.adminReply && (
            <div className="admin-reply">
              <div className="admin-badge">Admin</div>
              <p>{review.adminReply}</p>
            </div>
          )}

          <div className="public-replies">
            {review.replies?.map((reply) => (
              <div key={reply._key} className="reply-item">
                <p><strong>{reply.user || 'Anonymous'}</strong> - {formatDate(reply.createdAt)}</p>
                <p>{reply.comment}</p>
              </div>
            ))}
          </div>

          {replyingTo === review._id && (
            <div className="reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
              />
              <button onClick={() => handleReplySubmit(review._id)}>Submit Reply</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
