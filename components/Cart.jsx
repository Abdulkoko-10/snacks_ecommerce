import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineLeft,
  AiOutlineShopping,
} from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import { FaLock } from 'react-icons/fa';
import toast from "react-hot-toast";
//import Image from 'next/image'; // Import next/image

import { useStateContext } from "../context/StateContext";
import { urlFor } from "../lib/client";
import getStripe from "../lib/getStripe";

const Cart = () => {
  const cartWrapperRef = useRef(); // Renamed cartRef to cartWrapperRef for clarity
  const cartContainerRef = useRef(null); // New ref for the cart container itself

  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const panelTranslateY = useRef(0);
  const [isMobileView, setIsMobileView] = useState(false);

  const {
    totalPrice,
    totalQuantities,
    cartItems,
    showCart, // Added showCart to dependencies of useEffect if needed
    setShowCart,
    toggleCartItemQuanitity,
    onRemove,
    setCartItems,
    setTotalPrice,
    setTotalQuantities,
  } = useStateContext();

  useEffect(() => {
    const checkMobileView = () => {
      const newIsMobileView = window.innerWidth < 769;
      setIsMobileView(newIsMobileView);
      // If transitioning from mobile to desktop, and cart is open, reset transform
      if (!newIsMobileView && cartContainerRef.current && showCart) {
        cartContainerRef.current.style.transform = '';
        cartContainerRef.current.style.transition = ''; // Clear any inline transition
      }
    };
    checkMobileView(); // Initial check
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, [showCart]); // Include showCart to re-evaluate if cart open state matters for cleanup

  // Reset panel position when cart is opened/closed externally or view changes
  useEffect(() => {
    if (cartContainerRef.current) {
      if (!showCart || !isMobileView) {
        // Reset transform if cart is closed OR if not in mobile view
        // This ensures that desktop view doesn't have leftover transforms.
        cartContainerRef.current.style.transform = '';
        cartContainerRef.current.style.transition = ''; // Clear inline transition
        panelTranslateY.current = 0;
        if (isDragging) setIsDragging(false); // Reset dragging state if view changes mid-drag
      }
      // No 'else' needed to set to translateY(0) as CSS handles open state for both views
    }
  }, [showCart, isMobileView, isDragging]); // Added isDragging to deps


  const handleTouchStart = (e) => {
    // This handler is now conditionally attached, so direct check for isMobileView here is redundant
    // but good for safety if it were ever called directly.
    if (!isMobileView) return;

    // Check if the touch is on the scrollable product container and it's scrolled
    const productContainer = e.target.closest('.product-container');
    if (productContainer && productContainer.scrollTop > 0) {
      return; // Don't initiate drag, allow scrolling
    }

    touchStartY.current = e.touches[0].clientY;
    panelTranslateY.current = 0;
    setIsDragging(true);
    if (cartContainerRef.current) {
      cartContainerRef.current.style.transition = 'none'; // Disable transition for smooth dragging
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isMobileView) return;

    const currentTouchY = e.touches[0].clientY;
    let deltaY = currentTouchY - touchStartY.current;

    // Only allow dragging downwards
    if (deltaY < 0) {
      // Optional: Apply resistance for upward drag
      // deltaY /= 3; // Example: Make upward drag 3x harder
      deltaY = 0; // Or simply disallow upward drag past initial point
    }

    panelTranslateY.current = deltaY;

    if (cartContainerRef.current) {
      cartContainerRef.current.style.transform = `translateY(${panelTranslateY.current}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobileView) return;
    setIsDragging(false);

    if (cartContainerRef.current) {
      // Re-enable CSS transition for snap-back or dismiss animation
      cartContainerRef.current.style.transition = 'transform 0.3s ease-out';
    }

    const dismissThreshold = cartContainerRef.current ? cartContainerRef.current.offsetHeight * 0.4 : 150;

    if (panelTranslateY.current > dismissThreshold) {
      setShowCart(false);
      // panelTranslateY.current will be effectively reset by the useEffect listening to [showCart, isMobileView]
    } else {
      // Snap back
      if (cartContainerRef.current) {
        cartContainerRef.current.style.transform = 'translateY(0px)';
      }
      // panelTranslateY.current = 0; // Resetting here is fine, or rely on useEffect
    }
  };

  const handlePreOrder = () => {
    toast.success('Your pre-order has been placed successfully!');

    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);
    setShowCart(false);
  };

  const handleCheckout = async () => {
    // Condition to check if payment is locked
    const isPaymentLocked = true; // This can be a state or a constant for now

    if (isPaymentLocked) {
      toast.info("Payment processing is coming soon!"); // Using toast.info for a less alarming message
      return; // Exit the function, preventing Stripe checkout
    }

    // Original checkout logic (should not be reached if isPaymentLocked is true)
    const stripe = await getStripe();

    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems),
    });

    if (response.statusCode === 500) return;

    const data = await response.json();

    toast.loading("Redirecting...");

    stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <div className={`cart-wrapper ${showCart ? 'cart-wrapper-open' : ''}`} ref={cartWrapperRef}>
      <div
        className="cart-container glassmorphism"
        ref={cartContainerRef}
        onTouchStart={isMobileView ? handleTouchStart : undefined}
        onTouchMove={isMobileView ? handleTouchMove : undefined}
        onTouchEnd={isMobileView ? handleTouchEnd : undefined}
        // style={ isMobileView ? { touchAction: 'pan-y' } : {} } // Allow vertical scroll but prevent browser default horizontal page swipe on the panel
      >
        {/* Optional: Add a specific drag handle element here if preferred for mobile */}
        {/* <div className="cart-drag-handle"></div> */}
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)}
        >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        <div className="product-container">
          {cartItems.length >= 1 &&
            cartItems.map((item) => (
              <div className="product" key={item._id}>
                {/* <img
                  src={urlFor(item.image[0])}
                  className="cart-product-image"
                /> */}
                <img
                  src={urlFor(item.image[0]).url()}
                  alt={item.name}
                  width={180}
                  height={150}
                  className="cart-product-image"
                />
                <div className="item-desc">
                  <div className="flex top">
                    <h5 style={{touchAction: 'auto'}}>{item.name}</h5> {/* Ensure text selection/scrolling works */}
                    <h4 style={{touchAction: 'auto'}}>${item.price}</h4> {/* Ensure text selection/scrolling works */}
                  </div>
                  <div className="flex bottom">
                    <div>
                      <p className="quantity-desc" style={{touchAction: 'auto'}}> {/* Allow interactions */}
                        <span
                          className="minus"
                          onClick={() =>
                            toggleCartItemQuanitity(item._id, "dec")
                          }
                        >
                          <AiOutlineMinus />
                        </span>
                        <span className="num"> {/* Removed onClick="" */}
                          {item.quantity}
                        </span>
                        <span
                          className="plus"
                          onClick={() =>
                            toggleCartItemQuanitity(item._id, "inc")
                          }
                        >
                          <AiOutlinePlus />
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => onRemove(item)}
                    >
                      <TiDeleteOutline />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              <button type="button" className="btn" onClick={handlePreOrder}>
                Pre-order Now
              </button>
              <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block', width: '100%', marginTop: '10px' }}>
                <button type="button" className="btn btn-locked" onClick={handleCheckout} style={{ width: '100%' }}>
                  <FaLock style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Pay with Stripe
                </button>
                <span className="tooltip-text" style={{
                  visibility: 'hidden',
                  width: '120px',
                  backgroundColor: 'black',
                  color: '#fff',
                  textAlign: 'center',
                  borderRadius: '6px',
                  padding: '5px 0',
                  position: 'absolute',
                  zIndex: 1,
                  bottom: '125%',
                  left: '50%',
                  marginLeft: '-60px',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }}>
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
