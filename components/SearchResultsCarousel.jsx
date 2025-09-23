import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import ChatRecommendationCard from './chat/ChatRecommendationCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SearchResultsCarousel = ({ results }) => {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  return (
    <div className="maylike-products-wrapper">
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
        {results.map((restaurant) => {
          if (!restaurant || !restaurant.placeId) {
            return null;
          }
          const card = {
            canonicalProductId: restaurant.placeId,
            preview: {
              slug: restaurant.placeId,
              title: restaurant.name,
              image: restaurant.photos && restaurant.photos.length > 0 ? restaurant.photos[0] : "/FoodDiscovery.jpg",
              rating: restaurant.rating || 0,
              bestProvider: "N/A",
              eta: "N/A",
              minPrice: 0,
            },
            reason: restaurant.address,
          };
          return (
            <SwiperSlide key={card.canonicalProductId}>
              <ChatRecommendationCard card={card} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default SearchResultsCarousel;
