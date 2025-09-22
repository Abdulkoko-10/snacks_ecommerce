import React, { useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CardScene = styled.div`
  width: 100%;
  height: 100%;
  perspective: 1000px;
`;

const CardFlipper = styled.div`
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  cursor: pointer;

  &.is-flipped {
    transform: rotateY(180deg);
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
`;

const CardFront = styled(CardFace)``;

const DetailsText = styled.p`
  font-size: 0.85rem;
  line-height: 1.5;
  flex-grow: 1;
  overflow-y: auto;
  margin: 0;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  padding: 15px;
  justify-content: space-between;
  gap: 10px; /* Add gap between details and button area */
  color: var(--text-color);
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 15px;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 10px 35px -5px var(--glass-box-shadow-color);
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* Ensure the card fills the wrapper */
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

const DetailsButton = styled.a`
  display: block;
  width: 100%;
  padding: 10px;
  background-color: var(--accent-color);
  color: var(--text-on-accent-color);
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--accent-color-darker);
  }
`;

const ChatRecommendationCard = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) {
    return null;
  }

  const { preview, reason } = card;
  // const discount = "15% off"; // This is still mock data - REMOVED

  if (!preview.slug) {
    // Don't render a card if it can't link anywhere.
    // This could be replaced with a placeholder or different styling.
    return null;
  }

  const handleFlip = (e) => {
    // We stop propagation to prevent the link inside the back from being triggered
    // when we are just trying to flip the card. This is more of a safeguard.
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <CardScene onClick={handleFlip}>
      <CardFlipper className={isFlipped ? 'is-flipped' : ''}>
        <CardFront>
          <ProductCard>
            <ImageContainer>
              <Image
                src={preview.image}
                alt={preview.title}
                layout="fill"
                objectFit="cover"
              />
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
        </CardFront>
        <CardBack>
          <TextContent>
            <ProductName>Details</ProductName>
            <DetailsText>{preview.details || 'No details available.'}</DetailsText>
          </TextContent>
          <Link href={`/product/${preview.slug}`} passHref>
            <DetailsButton onClick={(e) => e.stopPropagation()}>View Full Details</DetailsButton>
          </Link>
        </CardBack>
      </CardFlipper>
    </CardScene>
  );
};

export default ChatRecommendationCard;
