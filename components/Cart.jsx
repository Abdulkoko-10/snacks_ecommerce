import React, { useRef, useEffect } from "react";
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
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

import { useStateContext } from "../context/StateContext";
import { urlFor } from "../lib/client";
import getStripe from "../lib/getStripe";

const Cart = () => {
  const cartRef = useRef(null);
  const contentRef = useRef(null); // For measuring content height
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

  // const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0; // Will be replaced by state
  const [currentWindowHeight, setCurrentWindowHeight] = React.useState(typeof window !== 'undefined' ? window.innerHeight : 0);
  const [cartHeight, setCartHeight] = React.useState(600); // Initial default height
  const peekHeight = 100; // How much of the cart is visible when closed

  useEffect(() => {
    const handleResize = () => {
      setCurrentWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    // Call it once to set initial height
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [{ y }, api] = useSpring(() => ({
    y: currentWindowHeight - peekHeight,
    config: { tension: 250, friction: 30 },
  }));

  const updateCartHeight = () => {
    if (contentRef.current) {
      const newHeight = contentRef.current.offsetHeight;
      setCartHeight(Math.max(newHeight, peekHeight + 50));
    }
  };

  // Call updateCartHeight when cartItems change or on initial mount
  useEffect(() => {
    updateCartHeight();
  }, [cartItems, totalQuantities, currentWindowHeight]); // Dependencies include currentWindowHeight

  const open = () => {
    updateCartHeight();
    api.start({ y: Math.max(0, currentWindowHeight - cartHeight), immediate: false });
  };

  const close = (velocity = 0) => {
    api.start({ y: currentWindowHeight - peekHeight, immediate: false });
  };

  const dismiss = () => {
    api.start({ y: currentWindowHeight, immediate: false, onRest: () => setShowCart(false) });
  };

  const bind = useDrag(
    ({ last, velocity: [, vy], movement: [, my], cancel, canceled, down }) => {
      const currentY = y.get();
      if (last) {
        // If dragged down significantly (more than 50% of cart height or with high velocity)
        if (my > cartHeight * 0.5 || vy > 0.8) {
          // If dragged below the peeking state, dismiss fully
          if (currentY + my > currentWindowHeight - peekHeight + (peekHeight / 2) ) {
            dismiss();
          } else {
            close(vy);
          }
        }
        // If dragged up significantly (more than 30% of cart height or with high velocity)
        else if (my < -cartHeight * 0.3 || vy < -0.5) {
          open();
        }
        // Snap based on current position if not a strong flick
        else {
          if (currentY < currentWindowHeight - cartHeight / 2) { // Closer to open state
            open();
          } else { // Closer to closed/peeking state
            close();
          }
        }
      } else { // While dragging
        api.start({ y: currentY + my, immediate: true });
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      // Ensure bounds are dynamically updated based on the latest cartHeight and currentWindowHeight
      bounds: {
        top: Math.max(0, currentWindowHeight - cartHeight),
        bottom: currentWindowHeight - peekHeight + peekHeight / 2
      },
      rubberband: 0.2,
      axis: 'y',
    }
  );

  // Effect to open/close cart based on totalQuantities or if cart becomes empty
  useEffect(() => {
    updateCartHeight(); // Ensure height is up-to-date
    if (totalQuantities > 0 && cartItems.length > 0) {
      // If it was previously fully dismissed (y = currentWindowHeight), bring to peek
      if (y.get() >= currentWindowHeight -10 ) { // give some tolerance
         api.start({ y: currentWindowHeight - peekHeight, immediate: true, onRest: open });
      } else {
        open();
      }
    } else if (cartItems.length === 0 && totalQuantities === 0) {
      // If cart is empty, slide to peek or dismiss
      if (y.get() < currentWindowHeight - peekHeight) { // if it's open or partially open
        close(); // Go to peek state
      }
    }
  }, [totalQuantities, cartItems.length, cartHeight, currentWindowHeight, open, close, y, api]);


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

  const cartWrapperStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure cart is above other content
    touchAction: 'none', // Recommended for useDrag
  };

  return (
    <animated.div
      className="cart-wrapper"
      ref={cartRef}
      style={{ ...cartWrapperStyle, y }}
      // {...bind()} // Bind will be moved to the drag handle
    >
      {/* Drag handle (e.g., the header area) */}
      <div
        {...bind()}
        className="cart-drag-handle"
        style={{ cursor: 'grab', padding: '20px 10px 10px 10px', textAlign: 'center', borderBottom: '1px solid #eee', touchAction: 'pan-y' }}
      >
        <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', margin: 'auto', borderRadius: '2px' }}></div>
      </div>
      <div
        className="cart-container glassmorphism"
        ref={contentRef}
        style={{ overflowY: 'auto', paddingBottom: '80px' }} // Allow content to scroll, padding for bottom buttons
      >
        {/* Cart Header - no longer the primary close button, but can be used to trigger close to peek */}
        <button
          type="button"
          className="cart-heading"
          onClick={() => {
            if (y.get() < windowHeight - peekHeight - 20) { // If fully or partially open
              close();
            } else { // If peeking, then try to open it (or could be dismiss)
              open();
            }
          }}
        >
          {/* <AiOutlineLeft />  Consider changing icon based on state or removing */}
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
    </div>
  );
};

export default Cart;