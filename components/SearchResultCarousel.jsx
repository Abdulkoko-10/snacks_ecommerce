import React from 'react';
import styled from '@emotion/styled';
import SearchResultCard from './SearchResultCard';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CarouselContainer = styled.div`
  /* Full-bleed effect */
  width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  margin-top: 15px;
  margin-bottom: 15px;
  padding: 10px 0; /* Add some vertical padding */

  .search-swiper .swiper-slide {
    height: 100%;
    display: flex;
    align-items: stretch; /* Make the card fill the slide's height */
    width: 280px; /* Give slides a fixed width */
  }

  .search-swiper .swiper-slide .card-wrapper {
    width: 100%; /* Make the card wrapper take full width of the slide */
  }
`;

const SearchResultCarousel = ({ results }) => {
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
        className="search-swiper"
      >
        {results.map((product) => (
          <SwiperSlide key={product.canonicalProductId}>
            <SearchResultCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </CarouselContainer>
  );
};

export default SearchResultCarousel;
