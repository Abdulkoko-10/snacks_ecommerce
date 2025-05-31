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
    showCart // Ensure showCart is destructured
  } = useStateContext();

  const isDesktopQueryValue = useMediaQuery('(min-width: 768px)');
  const [isClientReady, setIsClientReady] = useState(false);
  const [cartHeightTarget, setCartHeightTarget] = useState('middle');
  // const cartRef = useRef(); // Potentially remove if showCart state handles visibility (original comment)

  useEffect(() => {
    setIsClientReady(true);
  }, []); // Empty dependency array makes it run once on client mount

  // Determine isDesktop based on client readiness and query value
  // Defaults to false (mobile-first) on SSR and initial client render
  const isDesktop = isClientReady ? isDesktopQueryValue : false;

  useEffect(() => {
    if (isClientReady) { // Only proceed if client is ready
      if (showCart && !isDesktop) { // 'isDesktop' is the client-aware version
        setCartHeightTarget('middle'); // Always open to middle for mobile
      }
    }
    // No explicit reset on close needed as 'hidden' variant takes over. (original comment)
  }, [showCart, isDesktop, isClientReady, setCartHeightTarget]); // Added isClientReady and setCartHeightTarget to deps

  if (!isClientReady) {
    return null; // Don't render anything on the server or before client is ready
  }

  // Define variants and handlers inside the component or ensure they are in scope
  // These were previously defined outside the early return, so they are fine here.
  const desktopModalVariants = {
    hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  const mobilePanelVariants = {
    hidden: { y: "100%", opacity: 0 }, // Slides down by its own height (from bottom:0)
    visibleMiddle: { y: 0, opacity: 1, height: '50vh' },
    visibleTop: { y: 0, opacity: 1, height: '90vh' },
    // Spring transition is on the motion.div itself (original comment)
  };

  const handlePreOrder = () => {
    toast.success('Your pre-order has been placed successfully!');
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);
    setShowCart(false);
  };

  const handleCheckout = async () => {
    const isPaymentLocked = true;
    if (isPaymentLocked) {
      toast.info("Payment processing is coming soon!");
      return;
    }
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
    <motion.div
      className={isDesktop ? "cart-overlay" : "cart-panel-mobile"}
      initial="hidden"
      animate={isDesktop ? (showCart ? "visible" : "hidden") : (showCart ? (cartHeightTarget === 'top' ? 'visibleTop' : 'visibleMiddle') : 'hidden')}
      variants={isDesktop ? desktopModalVariants : mobilePanelVariants}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      drag={isDesktop ? false : "y"} // Corrected: drag should be "y" for mobile
      dragConstraints={{ top: 0, bottom: 0 }} // Corrected: define constraints for mobile
      dragElastic={0.2} // Corrected: provide a value for dragElastic for mobile
      onDragEnd={isDesktop ? undefined : (event, info) => {
        if (typeof window === 'undefined') return;

        const dragDistance = info.offset.y;
        const dragVelocity = info.velocity.y;
        const screenHeight = window.innerHeight;

        if (cartHeightTarget === 'middle') {
          if (dragDistance > screenHeight * 0.25 || (dragDistance > 0 && dragVelocity > 250)) {
            setShowCart(false);
          } else if (dragDistance < -screenHeight * 0.2 || (dragDistance < 0 && dragVelocity < -250)) {
            setCartHeightTarget('top');
          }
        } else if (cartHeightTarget === 'top') {
          if (dragDistance > screenHeight * 0.2 || (dragDistance > 0 && dragVelocity > 250)) {
            setCartHeightTarget('middle');
          }
        }
      }}
      onClick={(e) => {
        if (isDesktop && e.target === e.currentTarget) {
          setShowCart(false);
        }
      }}
    >
      <div className={`cart-container ${isDesktop ? 'cart-container-desktop' : 'cart-container-inner-mobile'} glassmorphism`}>
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
                <img
                  src={urlFor(item.image[0]).url()}
                  alt={item.name}
                  width={180}
                  height={150}
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
    </motion.div>
  );
};

export default Cart;
