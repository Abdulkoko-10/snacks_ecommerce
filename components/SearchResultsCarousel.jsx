import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import SearchResultCard from './SearchResultCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const SearchResultsCarousel = ({ results }) => {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  return (
    <div className="maylike-products-wrapper">
      {/* The h2 is removed as the heading is already present on the homepage */}
      <Swiper
        className="you-may-also-like-swiper"
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={15}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop={results.length > 1} // Only loop if there's more than one slide
        breakpoints={{
          // Responsive breakpoints
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1400: {
            slidesPerView: 4,
            spaceBetween: 30,
          }
        }}
      >
        {results.map((restaurant) => (
          restaurant && restaurant.placeId ? (
            <SwiperSlide key={restaurant.placeId}>
              <SearchResultCard restaurant={restaurant} />
            </SwiperSlide>
          ) : null
        ))}
      </Swiper>
    </div>
  );
};

export default SearchResultsCarousel;
