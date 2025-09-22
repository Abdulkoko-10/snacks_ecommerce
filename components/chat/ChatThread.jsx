import React, { Fragment } from 'react';
import styled from '@emotion/styled';
import { SignIn } from '@clerk/nextjs';
import ChatBubble from './ChatBubble';
import ChatRecommendationCard from './ChatRecommendationCard';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ThreadContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;

  /* Add padding to the bottom to avoid the input bar */
  padding-bottom: 95px;

  @media screen and (max-width: 800px) {
    padding-top: 70px; /* Add padding to prevent content from going under the toggle button */
    padding-bottom: 85px;
  }
`;

const ScrollableArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const RecommendationCarousel = styled.div`
  /* Full-bleed effect */
  width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  margin-top: 15px;
  margin-bottom: 15px;
  padding: 10px 0; /* Add some vertical padding */

  .recommendation-swiper .swiper-slide {
    height: 100%;
    display: flex;
    align-items: stretch; /* Make the card fill the slide's height */
    width: 280px; /* Give slides a fixed width */
  }

  .recommendation-swiper .swiper-slide .card-wrapper {
    width: 100%; /* Make the card wrapper take full width of the slide */
  }
`;

const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-top: 10px;
`;

/**
 * Renders a scrollable thread of chat messages and their recommendations.
 * @param {{
 *   messages: import('../../schemas/chat').ChatMessage[],
 *   recommendationsByMessageId?: Record<string, import('../../schemas/chat').ChatRecommendationCard[]>
 * }} props
 */
const ChatThread = ({ messages = [], recommendationsByMessageId = {} }) => {
  return (
    <ThreadContainer>
      <ScrollableArea>
        {messages.map((message) => {
          if (message.type === 'auth') {
            return (
              <Fragment key={message.id}>
                <ChatBubble message={message} />
                <AuthWrapper>
                  <SignIn signUpUrl="/sign-up" redirectUrl="/chat" />
                </AuthWrapper>
              </Fragment>
            );
          }

          const recommendations = recommendationsByMessageId[message.id];
          const hasRecommendations = recommendations && recommendations.length > 0;

          return (
            <Fragment key={message.id}>
              <ChatBubble
                message={message}
              />
              {message.role === 'assistant' && hasRecommendations && (
                <RecommendationCarousel>
                  <Swiper
                    modules={[EffectCoverflow, Pagination, Navigation]}
                    effect="coverflow"
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView="auto"
                    coverflowEffect={{
                      rotate: 50,
                      stretch: 0,
                      depth: 100,
                      modifier: 1,
                      slideShadows: true,
                    }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    className="recommendation-swiper"
                  >
                    {recommendations.map((card) => (
                      <SwiperSlide key={card.canonicalProductId}>
                        {/* This wrapper is the key to the fix. It gives Swiper a stable box to measure. */}
                        <div style={{ width: '280px', height: '100%' }}>
                          <ChatRecommendationCard card={card} />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </RecommendationCarousel>
              )}
            </Fragment>
          );
        })}
      </ScrollableArea>
    </ThreadContainer>
  );
};

export default ChatThread;
