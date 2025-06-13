import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import Product from './Product'; // Assuming Product.jsx is in the same components directory

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const MayLikeProducts = ({ products }) => {
  // It's good practice to check if products exist and is an array with items
  // This prevents errors if products is undefined, null, or empty.
  if (!Array.isArray(products) || products.length === 0) {
    return null; // Don't render the section if there are no products
  }

  return (
    <div className="maylike-products-wrapper">
      <h2>You may also like</h2>
      <Swiper
        className="you-may-also-like-swiper"
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={10} // Default spaceBetween, overridden by breakpoints
        slidesPerView={1} // Default slidesPerView, overridden by breakpoints
        navigation
        pagination={{ clickable: true }}
        loop={true} // Consider if loop is needed, can impact performance with many items
        breakpoints={{
          // when window width is >= 320px
          320: { slidesPerView: 1, spaceBetween: 10 },
          // when window width is >= 480px
          480: { slidesPerView: 1, spaceBetween: 15 },
          // when window width is >= 768px
          768: { slidesPerView: 1, spaceBetween: 15 },
          // when window width is >= 1024px
          1024: { slidesPerView: 1, spaceBetween: 15 },
        }}
      >
        {products.map((item) => (
          // Ensure item and item._id exist to prevent runtime errors
          item && item._id ? (
            <SwiperSlide key={item._id}>
              <Product product={item} />
            </SwiperSlide>
          ) : null
        ))}
      </Swiper>
    </div>
  );
};

export default MayLikeProducts;
