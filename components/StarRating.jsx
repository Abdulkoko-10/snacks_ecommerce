import React from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

const StarRating = ({ rating = 0, onRatingChange, isInput = false, starSize = 24 }) => {
  const stars = [];
  const totalStars = 5;

  const handleClick = (starIndex) => {
    if (isInput && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  for (let i = 0; i < totalStars; i++) {
    if (i < rating) {
      stars.push(
        <AiFillStar
          key={i}
          size={starSize}
          onClick={() => handleClick(i)}
          style={{ cursor: isInput ? 'pointer' : 'default', color: 'var(--primary-color)' }}
          className="star-icon"
        />
      );
    } else {
      stars.push(
        <AiOutlineStar
          key={i}
          size={starSize}
          onClick={() => handleClick(i)}
          style={{ cursor: isInput ? 'pointer' : 'default', color: 'var(--primary-color)' }}
          className="star-icon"
        />
      );
    }
  }

  return <div className="star-rating">{stars}</div>;
};

export default StarRating;
