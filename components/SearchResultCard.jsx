import React from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CardWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// Reusing the same styled components from ChatRecommendationCard for consistency
const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: var(--text-color);
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 10px 35px -5px var(--glass-box-shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
                inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
                0 15px 45px -5px var(--glass-box-shadow-color);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  background-color: var(--secondary-background-color);
`;

const TextContainer = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RestaurantName = styled.h3`
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RestaurantAddress = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: var(--accent-color);
  margin-top: auto;
  padding-top: 8px;
  align-self: flex-end;
`;

const SearchResultCard = ({ restaurant: product }) => { // Rename prop for clarity
  if (!product) {
    return null;
  }

  return (
    <CardWrapper className="card-wrapper">
      <ProductCard>
        <ImageContainer>
        <Image
          src={product.images && product.images.length > 0 ? product.images[0] : "/FoodDiscovery.jpg"}
          alt={product.title}
          layout="fill"
          objectFit="cover"
        />
      </ImageContainer>
      <TextContainer>
        <TextContent>
          <RestaurantName>{product.title}</RestaurantName>
          <RestaurantAddress>{product.address}</RestaurantAddress>
        </TextContent>
        {product.rating && (
          <RatingContainer>
            <FaStar /> {product.rating.toFixed(1)}
          </RatingContainer>
        )}
      </TextContainer>
    </ProductCard>
    </CardWrapper>
  );
};

export default SearchResultCard;
