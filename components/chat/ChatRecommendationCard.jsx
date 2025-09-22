import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { readClient } from '../../lib/client';

const CardScene = styled.div`
  width: 100%;
  height: 100%;
  perspective: 1000px;
  position: relative;
`;

const CardFlipper = styled.div`
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;

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

const CommentList = styled.div`
  font-size: 0.8rem;
  line-height: 1.4;
  flex-grow: 1;
  overflow-y: auto;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Comment = styled.div`
  border-bottom: 1px solid var(--glass-inner-shadow-color);
  padding-bottom: 8px;
  &:last-child {
    border-bottom: none;
  }
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  padding: 15px;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-color);
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  border-radius: 15px;
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 10px 35px -5px var(--glass-box-shadow-color);
`;

const FlipIconButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  padding: 0;
  backdrop-filter: blur(4px);
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  background-color: var(--secondary-background-color);
`;

const TextContainer = styled.div`
  padding: 12px;
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

const ProductName = styled.p`
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-color);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
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
  -webkit-line-clamp: 3;
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
  align-self: flex-end;
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
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RatingTag = styled(OverlayTag)`
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProviderAndEta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.9;
  margin-top: auto;
  padding-top: 8px;
`;

const ProviderName = styled.span`
  font-weight: 600;
`;

const Eta = styled.span``;

const ChatRecommendationCard = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!isLoadingComments && hasFetched) {
      setIsFlipped(true);
    }
  }, [isLoadingComments, hasFetched]);

  if (!card) {
    return null;
  }

  const { canonicalProductId, preview, reason } = card;

  const handleFlip = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isFlipped) {
      setIsFlipped(false);
      return;
    }

    if (hasFetched) {
      setIsFlipped(true);
      return;
    }

    setIsLoadingComments(true);
    setHasFetched(true);
    const commentsQuery = `*[_type == "review" && product._ref == $productId && approved == true] | order(_createdAt desc) [0...2]`;
    try {
      const fetchedComments = await readClient.fetch(commentsQuery, { productId: canonicalProductId });
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Failed to fetch comments for card:", error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  if (!preview.slug) {
    return null;
  }

  return (
    <CardScene>
      <FlipIconButton onClick={handleFlip} disabled={isLoadingComments}>
        {isLoadingComments ? '...' : <IoInformationCircleOutline />}
      </FlipIconButton>
      <CardFlipper className={isFlipped ? 'is-flipped' : ''}>
        <CardFront>
          <Link href={`/product/${preview.slug}`} passHref>
            <ProductCard as="a">
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
          </Link>
        </CardFront>
        <CardBack>
          <TextContent>
            <ProductName>Recent Comments</ProductName>
            {isLoadingComments && <p>Loading...</p>}
            {!isLoadingComments && comments.length === 0 && <p>No comments yet.</p>}
            {!isLoadingComments && comments.length > 0 && (
              <CommentList>
                {comments.map(comment => (
                  <Comment key={comment._id}>
                    <strong>{comment.user || 'Anonymous'}:</strong> {comment.comment}
                  </Comment>
                ))}
              </CommentList>
            )}
          </TextContent>
        </CardBack>
      </CardFlipper>
    </CardScene>
  );
};

export default ChatRecommendationCard;
