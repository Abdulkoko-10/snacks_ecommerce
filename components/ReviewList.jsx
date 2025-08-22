import React, { useState } from 'react';
import StarRating from './StarRating';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';

const ReviewList = ({ reviews = [], productId, onReviewUpdate }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [userName, setUserName] = useState(''); // For anonymous replies

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleLikeDislike = async (reviewId, action) => {
    try {
      const response = await fetch('/api/updateReviewStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });
      const data = await response.json();
      if (response.ok) {
        onReviewUpdate(); // Re-fetch reviews to show updated counts
      } else {
        console.error('Failed to update stats:', data.message);
      }
    } catch (error) {
      console.error('Error updating review stats:', error);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyContent.trim() || !userName.trim()) {
      alert('Please provide your name and a comment for the reply.');
      return;
    }
    try {
      const response = await fetch('/api/createReply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          user: userName,
          comment: replyContent,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setReplyContent('');
        setUserName('');
        setReplyingTo(null);
        onReviewUpdate(); // Re-fetch reviews
      } else {
        console.error('Failed to submit reply:', data.message);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
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

          {review.adminReply && (
            <div className="admin-reply">
              <div className="admin-badge-wrapper">
                <span className="admin-badge">Admin</span>
              </div>
              <p className="admin-reply-comment">{review.adminReply}</p>
            </div>
          )}

          <div className="review-actions">
            <div className="like-dislike-buttons">
              <button onClick={() => handleLikeDislike(review._id, 'like')} className="action-button like-button" data-testid={`like-button-${review._id}`}>
                <AiOutlineLike /> <span>{review.likes || 0}</span>
              </button>
              <button onClick={() => handleLikeDislike(review._id, 'dislike')} className="action-button dislike-button" data-testid={`dislike-button-${review._id}`}>
                <AiOutlineDislike /> <span>{review.dislikes || 0}</span>
              </button>
            </div>
            <button onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)} className="action-button reply-button">
              {replyingTo === review._id ? 'Cancel' : 'Reply'}
            </button>
          </div>

          {review.replies && review.replies.length > 0 && (
            <div className="public-replies-container">
              {review.replies.map((reply) => (
                <div key={reply._key} className="public-reply-item">
                  <div className="public-reply-header">
                    <span className="public-reply-user">{reply.user || 'Anonymous'}</span>
                    <span className="public-reply-date">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="public-reply-comment">{reply.comment}</p>
                </div>
              ))}
            </div>
          )}

          {replyingTo === review._id && (
            <div className="reply-form-container">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="reply-form-name"
                />
              </div>
              <div className="form-group">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows="3"
                  className="reply-form-textarea"
                />
              </div>
              <button onClick={() => handleReplySubmit(review._id)} className="btn btn-submit-reply">
                Submit Reply
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
