import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
import useMediaQuery from '../hooks/useMediaQuery'; // Import the hook

const Cart = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)'); // Call the hook
  // const [cartHeightTarget, setCartHeightTarget] = useState('middle'); // Removed for dynamic height
  const [dynamicCartHeight, setDynamicCartHeight] = useState(0);
  const dragStartHeight = useRef(0);
  // const cartRef = useRef(); // Potentially remove if showCart state handles visibility
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    setShowCart,
    toggleCartItemQuanitity,
    onRemove,
    setCartItems,
    setTotalPrice,
    setTotalQuantities,
  } = useStateContext();

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

  const desktopModalVariants = {
    hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  const mobilePanelVariants = {
    // hidden: { y: "100%", opacity: 0 }, // Slides down by its own height (from bottom:0)
    // visibleMiddle: { y: 0, opacity: 1, height: '50vh' }, // Height now dynamic
    // visibleTop: { y: 0, opacity: 1, height: '90vh' }, // Height now dynamic
    hidden: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    // Spring transition is on the motion.div itself for y, opacity. Height is via style prop.
  };

  const { showCart } = useStateContext(); // Ensure showCart is destructured

  useEffect(() => {
    if (showCart && !isDesktop) {
      // setCartHeightTarget('middle'); // Always open to middle for mobile // Removed
      if (typeof window !== 'undefined') {
        const initialHeight = window.innerHeight * 0.5;
        setDynamicCartHeight(initialHeight);
      }
    }
    // No explicit reset on close needed as 'hidden' variant takes over.
  }, [showCart, isDesktop]); // Removed setCartHeightTarget from deps

  return (
    <motion.div
      className={isDesktop ? "cart-overlay" : "cart-panel-mobile"} // Use new class "cart-panel-mobile"
      style={!isDesktop ? { height: dynamicCartHeight } : {}}
      initial="hidden"
      animate={isDesktop ? (showCart ? "visible" : "hidden") : (showCart ? "visible" : "hidden")}
      variants={isDesktop ? desktopModalVariants : mobilePanelVariants}
      transition={{ type: "spring", stiffness: 200, damping: 25 }} // Applies to y and opacity
      drag={isDesktop ? false : "y"}
      dragConstraints={isDesktop ? false : { top: 0, bottom: 0 }}
      dragElastic={isDesktop ? false : 0.2}
      onDragStart={() => {
        if (!isDesktop) {
          dragStartHeight.current = dynamicCartHeight;
        }
      }}
      onDrag={(event, info) => {
        if (!isDesktop && typeof window !== 'undefined') {
          const dragOffset = info.offset.y;
          let newHeight = dragStartHeight.current - dragOffset; // Drag up (negative offset) increases height

          const minPanelHeight = window.innerHeight * 0.20;
          const maxPanelHeight = window.innerHeight * 0.90;

          newHeight = Math.max(minPanelHeight, newHeight);
          newHeight = Math.min(maxPanelHeight, newHeight);

          setDynamicCartHeight(newHeight);
        }
      }}
      onDragEnd={isDesktop ? undefined : (event, info) => {
        if (typeof window === 'undefined') return;

        const offsetY = info.offset.y; // How far the cursor was dragged from its starting position
        const velocityY = info.velocity.y;
        const screenHeight = window.innerHeight;
        const currentHeight = dynamicCartHeight; // Height at the point of release

        // Dismissal conditions
        // 1. Strong downward velocity and dragged down a bit
        if (velocityY > 300 && offsetY > screenHeight * 0.1) {
          setShowCart(false);
          return; // Exit after dismissal
        }
        // 2. Panel height is already very small (dragged down a lot)
        if (currentHeight < screenHeight * 0.25) {
          setShowCart(false);
          return; // Exit after dismissal
        }

        // Settling logic (if not dismissed)
        const midPoint = screenHeight * 0.55;
        const topPoint = screenHeight * 0.90;
        const minOpenHeight = screenHeight * 0.30; // Smallest height it should snap to if not dismissed

        let targetHeight = currentHeight;

        // If current height is below the minimum open height, snap to minOpenHeight
        if (targetHeight < minOpenHeight) {
          targetHeight = minOpenHeight;
        }
        // Or, if current height is significantly high, try to snap to topPoint or midPoint
        // Check proximity to midPoint
        else if (Math.abs(currentHeight - midPoint) < screenHeight * 0.15) {
          targetHeight = midPoint;
        }
        // Check proximity to topPoint
        else if (Math.abs(currentHeight - topPoint) < screenHeight * 0.15) {
          targetHeight = topPoint;
        }
        // If not close to any specific snap point but above minOpenHeight,
        // it could potentially stay where it is or snap based on velocity/direction.
        // For simplicity now, we'll ensure it's at least minOpenHeight and at most topPoint.
        // (More complex logic could consider flick to top/middle if not near a snap point)

        // Ensure targetHeight does not exceed topPoint
        targetHeight = Math.min(targetHeight, topPoint);
        // And ensure it's at least minOpenHeight if not dismissed
        targetHeight = Math.max(targetHeight, minOpenHeight);


        // Animate to the target height
        // The motion.div's transition will handle the animation to this new height
        setDynamicCartHeight(targetHeight);
      }}
      onClick={(e) => { // Handle overlay click for desktop
        if (isDesktop && e.target === e.currentTarget) {
          setShowCart(false);
        }
        // Potentially add for mobile if clicking outside visible panel (on an overlay part of cart-panel-mobile if it existed)
        // else if (!isDesktop && e.target === e.currentTarget) {
        //   setShowCart(false);
        // }
      }}
      // ref={cartRef} // Removed as animation handles visibility
    >
      {/* Consider adding a visual drag handle if design requires */}
      {/* <div className="drag-handle"></div> (and style it) */}
      <div className={`cart-container ${isDesktop ? 'cart-container-desktop' : 'cart-container-inner-mobile'} glassmorphism`}>
        {/* Keep glassmorphism for now, can be removed or adjusted via CSS if needed for desktop / or applied to cart-panel-mobile */}
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)}
        >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {/* Mobile Structure */}
        {!isDesktop && (
          <>
            <div className="product-scroll-area">
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
              {cartItems.length >= 1 && (
                <div className="product-container">
                  {cartItems.map((item) => (
                    <div className="product" key={item._id}>
                      <img
                        src={urlFor(item.image[0]).url()}
                        alt={item.name}
                        width={180} // from CSS .cart-product-image
                        height={150} // from CSS .cart-product-image
                        className="cart-product-image"
                      />
                      <div className="item-desc">
                        <div className="flex top">
                          <h5>{item.name}</h5>
                          <h4>${item.price}</h4>
                        </div>
                        <div className="flex bottom">
                          <div>
                            <p className="quantity-desc">
                              <span
                                className="minus"
                                onClick={() =>
                                  toggleCartItemQuanitity(item._id, "dec")
                                }
                              >
                                <AiOutlineMinus />
                              </span>
                              <span className="num" onClick="">
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
              )}
            </div>
            <div className="cart-checkout-area">
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
                        bottom: '125%', // Position above the button
                        left: '50%',
                        marginLeft: '-60px', // Center the tooltip
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
          </>
        )}

        {/* Desktop Structure */}
        {isDesktop && (
          <>
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
                    <img
                      src={urlFor(item.image[0]).url()}
                      alt={item.name}
                      width={180} // from CSS .cart-product-image
                      height={150} // from CSS .cart-product-image
                      className="cart-product-image"
                    />
                    <div className="item-desc">
                      <div className="flex top">
                        <h5>{item.name}</h5>
                        <h4>${item.price}</h4>
                      </div>
                      <div className="flex bottom">
                        <div>
                          <p className="quantity-desc">
                            <span
                              className="minus"
                              onClick={() =>
                                toggleCartItemQuanitity(item._id, "dec")
                              }
                            >
                              <AiOutlineMinus />
                            </span>
                            <span className="num" onClick="">
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
                      bottom: '125%', // Position above the button
                      left: '50%',
                      marginLeft: '-60px', // Center the tooltip
                      opacity: 0,
                      transition: 'opacity 0.3s'
                    }}>
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;
