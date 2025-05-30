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
  const [cartHeightTarget, setCartHeightTarget] = useState('middle');
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
    hidden: { y: "50vh", opacity: 0 }, // Assuming initial CSS height 50vh, slide down by that amount
    visibleMiddle: { y: 0, opacity: 1, height: '50vh' },
    visibleTop: { y: 0, opacity: 1, height: '90vh' },
    // Spring transition is on the motion.div itself
  };

  const { showCart } = useStateContext(); // Ensure showCart is destructured

  useEffect(() => {
    if (showCart) {
      setCartHeightTarget('middle'); // Always open to middle
    }
    // No explicit reset on close needed as 'hidden' variant takes over.
  }, [showCart, setCartHeightTarget]); // Added setCartHeightTarget to dependency array as per linting best practices

  return (
    <motion.div
      className={isDesktop ? "cart-overlay" : "cart-panel-mobile"} // Use new class "cart-panel-mobile"
      initial="hidden"
      animate={showCart ? (cartHeightTarget === 'top' ? 'visibleTop' : 'visibleMiddle') : 'hidden'}
      variants={isDesktop ? desktopModalVariants : mobilePanelVariants}
      transition={{ type: "spring", stiffness: 200, damping: 25 }} // Added default transition here
      drag={isDesktop ? false : "y"}
      dragConstraints={isDesktop ? false : { top: 0 }}
      dragElastic={isDesktop ? false : { top: 0.1, bottom: 0.5 }}
      onDragEnd={isDesktop ? null : (event, info) => {
        const dragDistance = info.offset.y;
        const dragVelocity = info.velocity.y;
        // It's good practice to ensure window is defined (for SSR frameworks like Next.js)
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

        if (cartHeightTarget === 'middle') {
          if (dragDistance > screenHeight * 0.2 || (dragDistance > 0 && dragVelocity > 200)) {
            setShowCart(false);
          } else if (dragDistance < -screenHeight * 0.15 || (dragDistance < 0 && dragVelocity < -200)) {
            setCartHeightTarget('top');
          }
        } else if (cartHeightTarget === 'top') {
          if (dragDistance > screenHeight * 0.2 || (dragDistance > 0 && dragVelocity > 200)) {
            setCartHeightTarget('middle');
          }
        }
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
                  width={180} // from CSS .cart-product-image
                  height={150} // from CSS .cart-product-image
                  className="cart-product-image"
                  // layout="responsive" // This might require parent to have defined aspect ratio or size
                  // objectFit="cover" // If using layout="responsive" or "fill"
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
      </div>
    </motion.div>
  );
};

export default Cart;
