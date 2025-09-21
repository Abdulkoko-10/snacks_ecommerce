import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CardLink = styled.a`
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text-color);
  background: var(--secondary-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  box-shadow: 0 4px 15px -2px var(--glass-box-shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  width: 250px; /* Fixed width for carousel items */
  flex-shrink: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px -4px var(--glass-box-shadow-color);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 70%; /* Aspect ratio for the image (70% of the card height) */
  background-color: var(--secondary-background-color);
`;

const OverlayTag = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
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

const CentralBadge = styled(OverlayTag)`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 12px;
  font-size: 1rem;
  border-radius: 8px;
`;

const TextContainer = styled.div`
  padding: 12px;
`;

const Title = styled.h4`
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubText = styled.p`
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
  opacity: 0.8;
`;

const Price = styled.span`
  font-weight: 500;
  margin-left: 8px;
`;

/**
 * Renders a single recommendation card based on the new design.
 * @param {{card: import('../../schemas/chat').ChatRecommendationCard}} props
 */
const ChatRecommendationCard = ({ card }) => {
  if (!card) {
    return null;
  }

  const { canonicalProductId, preview, reason } = card;
  // Mock data for new design elements
  const discount = "20% off";
  const centralBenefit = "Happy";

  return (
    <Link href={`/product/${canonicalProductId}`} passHref>
      <CardLink>
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
          {centralBenefit && <CentralBadge>{centralBenefit}</CentralBadge>}
        </ImageContainer>
        <TextContainer>
          <Title>{preview.title}</Title>
          <SubText>
            {preview.originSummary ? preview.originSummary.join(', ') : 'Various Cuisines'}
            <Price>${preview.minPrice.toFixed(2)}</Price>
          </SubText>
        </TextContainer>
      </CardLink>
    </Link>
  );
};

export default ChatRecommendationCard;
