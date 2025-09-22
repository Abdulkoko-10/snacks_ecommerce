import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CardWrapper = styled.div`
  /* This wrapper now takes the full width of the swiper slide */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* The classname is added in ChatThread.jsx */
  &.card-wrapper {
    /* This empty class is for targeting from parent */
  }
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* Ensure the card fills the wrapper */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: var(--text-color);
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 10px 35px -5px var(--glass-box-shadow-color);

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
  /* Use a fixed aspect ratio for the image container */
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  background-color: var(--secondary-background-color);
`;

const TextContainer = styled.div`
  padding: 12px;
  flex-grow: 1; /* This is key for filling space */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes price to the bottom */
  gap: 8px; /* Space between text elements */
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductName = styled.p`
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-color);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Clamp to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductReason = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Clamp to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPrice = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
  color: var(--accent-color);
  align-self: flex-end; /* Align price to the right */
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
const ProviderAndEta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.9;
  margin-top: auto; /* Pushes to the bottom of the flex container */
  padding-top: 8px; /* Add some space above */
`;

const ProviderName = styled.span`
  font-weight: 600;
`;

const Eta = styled.span``;

const ChatRecommendationCard = ({ card }) => {
  if (!card) {
    return null;
  }

  const { canonicalProductId, preview, reason } = card;
  // const discount = "15% off"; // This is still mock data - REMOVED

  return (
    <CardWrapper className="card-wrapper">
      <Link href={`/product/${canonicalProductId}`} passHref>
        <ProductCard as="a"> {/* Use `as="a"` for semantics with Next.js Link */}
          <ImageContainer>
            <Image
              src={preview.image}
              alt={preview.title}
              layout="fill"
              objectFit="cover"
            />
            {/* {discount && <DiscountTag>{discount}</DiscountTag>} */}
            <RatingTag>
              <FaStar size={12} /> {preview.rating.toFixed(1)}
            </RatingTag>
          </ImageContainer>
          <TextContainer>
            <TextContent>
              <ProductName>{preview.title}</ProductName>
              <ProductReason>{reason}</ProductReason>
            </TextContent>
            <ProviderAndEta>
              <ProviderName>{preview.bestProvider}</ProviderName>
              <Eta>~{preview.eta}</Eta>
            </ProviderAndEta>
            <ProductPrice>~N{preview.minPrice.toFixed(2)}</ProductPrice>
          </TextContainer>
        </ProductCard>
      </Link>
    </CardWrapper>
  );
};

export default ChatRecommendationCard;
