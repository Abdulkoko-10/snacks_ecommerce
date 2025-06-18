import React from "react";
import Link from "next/link";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineShopping,
} from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import { FaLock } from 'react-icons/fa';
import toast from "react-hot-toast";
import { SwipeableDrawer } from '@mui/material';
import Image from 'next/image'; // Import next/image
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/router'; // Added import

import { useStateContext } from "../context/StateContext";
import { urlFor } from "../lib/client";
import getStripe from "../lib/getStripe";

const Cart = () => {
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const { isSignedIn, user } = useUser(); // Get user and signedIn status
  const router = useRouter(); // Added router instance
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    showCart,
    setShowCart, // Used to close cart
    toggleCartItemQuanitity,
    onRemove,
    // These are removed from direct use in handlePreOrder here:
    // setCartItems,
    // setTotalPrice,
    // setTotalQuantities,
  } = useStateContext();

  const handlePreOrder = () => {
    // No toast here, navigation will occur
    // No cart clearing here, PreOrderCheckout.jsx handles it after submission
    setShowCart(false); // Close the cart drawer
    router.push('/pre-order'); // Navigate to the pre-order page
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

    // Transform cartItems for Stripe, including imageUrl
    const itemsForStripe = cartItems.map(item => ({
      // Include all necessary properties for Stripe
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      _id: item._id, // Pass _id for reference if needed by Stripe or for your records
      // Generate a moderately-sized image URL for Stripe Checkout
      imageUrl: urlFor(item.image && item.image[0]).width(200).url(),
      // Ensure other properties required by your Stripe API route are included
    }));

    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemsForStripe), // Send transformed items
    });

    if (response.statusCode === 500) return;

    const data = await response.json();

    toast.loading("Redirecting...");

    stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={showCart}
      onClose={() => setShowCart(false)}
      onOpen={() => setShowCart(true)}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          color: 'var(--text-color)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
        }
      }}
    >
      <div className="cart-container" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="cart-heading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
          <span className="heading" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Your Cart</span>
          <span className="cart-num-items" style={{ marginLeft: '10px', color: 'var(--text-color)' }}>({totalQuantities} items)</span>
        </div>
        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3 style={{color: 'var(--text-color)'}}>Your shopping bag is empty</h3>
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
                <Image
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
                    <h5 style={{ color: 'var(--text-color)' }}>{item.name}</h5>
                    <h4 style={{ color: 'var(--text-color)' }}>${item.price}</h4>
                  </div>
                  <div className="flex bottom">
                    <div>
                      <p className="quantity-desc" style={{ border: '1px solid var(--secondary-background-color)'}}>
                        <span
                          className="minus"
                          onClick={() =>
                            toggleCartItemQuanitity(item._id, "dec")
                          }
                        >
                          <AiOutlineMinus style={{ color: 'var(--text-color)' }} />
                        </span>
                        <span className="num" onClick="" style={{ borderLeft: '1px solid var(--secondary-background-color)', borderRight: '1px solid var(--secondary-background-color)', color: 'var(--text-color)'}}>
                          {item.quantity}
                        </span>
                        <span
                          className="plus"
                          onClick={() =>
                            toggleCartItemQuanitity(item._id, "inc")
                          }
                        >
                          <AiOutlinePlus style={{ color: 'var(--text-color)' }} />
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => onRemove(item)}
                      style={{ color: 'var(--primary-color)' }}
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
              <h3 style={{ color: 'var(--text-color)' }}>Subtotal:</h3>
              <h3 style={{ color: 'var(--text-color)' }}>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              {isSignedIn ? (
                <button type="button" className="btn" onClick={handlePreOrder}>
                  Pre-order Now
                </button>
              ) : (
                <SignInButton
                  mode="modal"
                >
                  <button type="button" className="btn">
                    Sign In to Pre-order
                  </button>
                </SignInButton>
              )}
              <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block', width: '100%', marginTop: '10px' }}>
                <button type="button" className="btn btn-locked" onClick={handleCheckout} style={{ width: '100%' }}>
                  <FaLock style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Pay with Stripe
                </button>
                <span className="tooltip-text" style={{
                  visibility: 'hidden',
                  width: '120px',
                  backgroundColor: 'var(--secondary-background-color)', // Theme-aware
                  color: 'var(--text-color)', // Theme-aware
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
    </SwipeableDrawer>
  );
};

export default Cart;
