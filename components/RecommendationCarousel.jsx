import React from 'react';
import styled from '@emotion/styled';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import ChatRecommendationCard from './chat/ChatRecommendationCard';

const CarouselContainer = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 15px;
  margin-bottom: 15px;
  padding: 10px 0;

  .recommendation-swiper .swiper-slide {
    height: 100%;
    display: flex;
    align-items: stretch;
    width: 280px;
  }

  .recommendation-swiper .swiper-slide .card-wrapper {
    width: 100%;
  }
`;

const RecommendationCarousel = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <CarouselContainer>
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
          <SwiperSlide key={card.canonicalProductId || card.placeId}>
            <ChatRecommendationCard card={card} />
          </SwiperSlide>
        ))}
      </Swiper>
    </CarouselContainer>
  );
};

export default RecommendationCarousel;