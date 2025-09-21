import React from 'react';
import styled from '@emotion/styled';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import ChatRecommendationCard from './ChatRecommendationCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const BubbleWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
  animation: fadeIn 0.3s ease-out;
  width: 100%;
  box-sizing: border-box;

  &.assistant {
    justify-content: flex-start;
  }

  &.user {
    justify-content: flex-end;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const BubbleAndCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 85%;
  min-width: 0;

  @media screen and (max-width: 800px) {
    max-width: 95%;
  }
`;

const Bubble = styled.div`
  padding: 12px 18px;
  border-radius: 20px;
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 4px 8px -2px var(--glass-box-shadow-color);
  color: var(--text-color);
  word-wrap: break-word;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;

  .assistant & {
    border-bottom-left-radius: 5px;
  }

  .user & {
    border-bottom-right-radius: 5px;
    background: rgba(var(--accent-color-rgb-values, 255, 165, 0), 0.2);
    align-self: flex-end;
  }
`;

const BubbleText = styled.p`
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 1rem;
`;

const CarouselContainer = styled.div`
  width: 100%;
  margin-top: 15px;
  perspective: 1000px; /* For the 3D effect */

  .swiper-slide {
    transition: transform 0.5s;
  }
`;

/**
 * Renders a single chat message bubble and any associated recommendation cards.
 * @param {{
 *   message: import('../../schemas/chat').ChatMessage,
 *   recommendations?: import('../../schemas/chat').ChatRecommendationCard[]
 * }} props
 */
const ChatBubble = ({ message, recommendations }) => {
  const { role, text } = message;
  const isUser = role === 'user';
  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <BubbleWrapper data-testid="chat-bubble-wrapper" className={isUser ? 'user' : 'assistant'}>
      <BubbleAndCardsContainer>
        <Bubble>
          <BubbleText>{text}</BubbleText>
        </Bubble>
        {hasRecommendations && (
          <CarouselContainer>
            <Swiper
              modules={[Navigation, A11y]}
              spaceBetween={15}
              slidesPerView={'auto'}
              navigation
              className="you-may-also-like-swiper" // Reuse existing styles for nav buttons
              onSlideChange={(swiper) => {
                // 3D "coming out of page" effect
                swiper.slides.forEach(slide => {
                  const slideInView = slide.progress > -1 && slide.progress < 1;
                  const rotate = slide.progress * -30; // Rotate based on progress
                  const z = (1 - Math.abs(slide.progress)) * 100 - 100; // Move in Z-axis
                  slide.style.transform = slideInView ? `rotateY(${rotate}deg) translateZ(${z}px)` : 'transform: none;';
                });
              }}
            >
              {recommendations.map((card) => (
                <SwiperSlide key={card.canonicalProductId} style={{ width: 'auto' }}>
                  <ChatRecommendationCard card={card} />
                </SwiperSlide>
              ))}
            </Swiper>
          </CarouselContainer>
        )}
      </BubbleAndCardsContainer>
    </BubbleWrapper>
  );
};

export default ChatBubble;
