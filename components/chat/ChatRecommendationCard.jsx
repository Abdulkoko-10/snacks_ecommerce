import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CardWrapper = styled.div`
  width: 180px;
  flex-shrink: 0;
`;

const ProductCard = styled.div` /* Changed from styled.a */
  display: block;
  cursor: pointer;
  transform: scale(1, 1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: var(--text-color);
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 15px;
  padding: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 10px 35px -5px var(--glass-box-shadow-color);

  &:hover {
    transform: scale(1.05);
    box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
                inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
                0 12px 40px -5px var(--glass-box-shadow-color);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  border-radius: 10px;
  background-color: var(--secondary-background-color);
  overflow: hidden;
  padding-top: 93.33%;
`;

const ProductName = styled.p`
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-color);
  margin: 8px 0 4px 0;
`;

const ProductPrice = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  margin: 0;
  color: var(--text-color);
  opacity: 0.8;
`;

const OverlayTag = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const DiscountTag = styled(OverlayTag)`
  top: 8px;
  left: 8px;
  background-color: var(--accent-color);
  color: var(--text-on-accent-color);
`;

const RatingTag = styled(OverlayTag)`
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

/**
 * Renders a recommendation card styled like a Product card.
 * @param {{card: import('../../schemas/chat').ChatRecommendationCard}} props
 */
const ChatRecommendationCard = ({ card }) => {
  if (!card) {
    return null;
  }

  const { canonicalProductId, preview } = card;
  const discount = "15% off";

  return (
    <CardWrapper>
      <Link href={`/product/${canonicalProductId}`}>
        <ProductCard>
          <ImageContainer>
            <Image
              src={preview.image}
              alt={preview.title}
              layout="fill"
              objectFit="cover"
            />
            {discount && <DiscountTag>{discount}</DiscountTag>}
            <RatingTag>
              <FaStar size={12} /> {preview.rating.toFixed(1)}
            </RatingTag>
          </ImageContainer>
          <ProductName>{preview.title}</ProductName>
          <ProductPrice>${preview.minPrice.toFixed(2)}</ProductPrice>
        </ProductCard>
      </Link>
    </CardWrapper>
  );
};

export default ChatRecommendationCard;
