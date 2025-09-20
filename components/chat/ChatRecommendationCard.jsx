import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const CardContainer = styled.div`
  display: flex;
  gap: 15px;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color);
  background: rgba(var(--secondary-background-rgb-values, 224, 231, 239), 0.5);
  border: 1px solid var(--glass-edge-highlight-color);
  box-shadow: 0 4px 10px -2px var(--glass-box-shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px -3px var(--glass-box-shadow-color);
  }
`;

const ImageWrapper = styled.div`
  flex-shrink: 0;
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--secondary-background-color);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-grow: 1;
  min-width: 0;
`;

const Title = styled.h4`
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Reason = styled.p`
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
  opacity: 0.9;
`;

const Details = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 0.85rem;
  margin-top: 8px;
`;

const DetailSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    color: var(--accent-color);
  }
`;

const Provider = styled.div`
  font-size: 0.85rem;
  margin-top: 4px;
  opacity: 0.8;
`;

/**
 * Renders a single recommendation card.
 * @param {{card: import('../../schemas/chat').ChatRecommendationCard}} props
 */
const ChatRecommendationCard = ({ card }) => {
  if (!card) {
    return null;
  }

  const { canonicalProductId, preview, reason } = card;

  return (
    <Link href={`/product/${canonicalProductId}`}>
      <CardContainer>
        <ImageWrapper>
          <Image
            src={preview.image}
            alt={preview.title}
            layout="fill"
            objectFit="cover"
          />
        </ImageWrapper>
        <Content>
          <Title>{preview.title}</Title>
          <Reason>{reason}</Reason>
          <Details>
            <DetailSpan>
              <FaStar /> {preview.rating.toFixed(1)}
            </DetailSpan>
            <DetailSpan>
              From ${preview.minPrice.toFixed(2)}
            </DetailSpan>
            <DetailSpan>
              {preview.eta}
            </DetailSpan>
          </Details>
          <Provider>
            Best offer on: <strong>{preview.bestProvider}</strong>
          </Provider>
        </Content>
      </CardContainer>
    </Link>
  );
};

export default ChatRecommendationCard;
