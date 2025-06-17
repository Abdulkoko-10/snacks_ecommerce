import React, { useState } from "react"; // Added useState
import Link from "next/link";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineShopping,
} from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import { FaLock, FaGift } from 'react-icons/fa'; // Added FaGift for pre-order icon
import toast from "react-hot-toast";
import { SwipeableDrawer } from '@mui/material';
import Image from 'next/image';
import { useUser, SignInButton } from '@clerk/nextjs';

import { useStateContext } from "../context/StateContext";
import { urlFor } from "../lib/client";
import getStripe from "../lib/getStripe";
import { PreorderModal } from './'; // Import PreorderModal

const Cart = () => {
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const { isSignedIn } = useUser(); // user object already available via useStateContext or direct useUser if needed for more details
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    showCart,
    setShowCart,
    toggleCartItemQuanitity,
    onRemove,
    setCartItems,
    setTotalPrice,
    setTotalQuantities,
  } = useStateContext();

  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
  const [selectedPreorderProduct, setSelectedPreorderProduct] = useState(null);

  const handleOpenPreorderModal = (product) => {
    // Assuming product object in cartItems has name, _id, quantity
    setSelectedPreorderProduct({
      name: product.name,
      _id: product._id, // Or however product ID is stored
      quantity: product.quantity, // Current quantity in cart
    });
    setIsPreorderModalOpen(true);
  };

  const handlePreOrder = () => {
    // This is the existing global pre-order, may need renaming or rethinking
    // For now, let's assume it's a different kind of pre-order (e.g. pre-order entire cart)
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
    const itemsForStripe = cartItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      _id: item._id,
      imageUrl: urlFor(item.image && item.image[0]).width(200).url(),
    }));

    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemsForStripe),
    });

    if (response.statusCode === 500) return;
    const data = await response.json();
    toast.loading("Redirecting...");
    stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <>
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
                <div className="product" key={item._id} style={{ alignItems: 'flex-start' }}> {/* Align items to start for button placement */}
                  <Image
                    src={urlFor(item.image[0]).url()}
                    alt={item.name}
                    width={120} // Adjusted size for cart
                    height={100} // Adjusted size for cart
                    className="cart-product-image"
                  />
                  <div className="item-desc" style={{ flexGrow: 1 }}> {/* Allow item-desc to grow */}
                    <div className="flex top">
                      <h5 style={{ color: 'var(--text-color)', marginBottom: '5px' }}>{item.name}</h5>
                      <h4 style={{ color: 'var(--text-color)' }}>${item.price}</h4>
                    </div>
                    {/* Quantity controls and remove button container */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <p className="quantity-desc" style={{ border: '1px solid var(--secondary-background-color)', margin: 0 }}>
                        <span
                          className="minus"
                          onClick={() => toggleCartItemQuanitity(item._id, "dec")}
                        >
                          <AiOutlineMinus style={{ color: 'var(--text-color)' }} />
                        </span>
                        <span className="num" style={{ borderLeft: '1px solid var(--secondary-background-color)', borderRight: '1px solid var(--secondary-background-color)', color: 'var(--text-color)'}}>
                          {item.quantity}
                        </span>
                        <span
                          className="plus"
                          onClick={() => toggleCartItemQuanitity(item._id, "inc")}
                        >
                          <AiOutlinePlus style={{ color: 'var(--text-color)' }} />
                        </span>
                      </p>
                      <button
                        type="button"
                        className="remove-item"
                        onClick={() => onRemove(item)}
                        style={{ color: 'var(--primary-color)' }}
                      >
                        <TiDeleteOutline />
                      </button>
                    </div>
                    {/* Pre-order button for individual item */}
                    {isSignedIn && (
                      <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-preorder-cart"
                          onClick={() => handleOpenPreorderModal(item)}
                        >
                          <FaGift style={{ marginRight: '5px' }} /> Pre-order This
                        </button>
                      </div>
                    )}
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
                {/* This is the existing global Pre-order / Sign In button */}
                {isSignedIn ? (
                  <button type="button" className="btn" onClick={handlePreOrder} style={{ marginBottom: '10px' }}>
                    Pre-order All (Test)
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button type="button" className="btn" style={{ marginBottom: '10px' }}>
                      Sign In to Pre-order All
                    </button>
                  </SignInButton>
                )}
                <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <button type="button" className="btn btn-locked" onClick={handleCheckout} style={{ width: '100%' }}>
                    <FaLock style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Pay with Stripe
                  </button>
                  <span className="tooltip-text" style={{
                    visibility: 'hidden', width: '120px', backgroundColor: 'var(--secondary-background-color)',
                    color: 'var(--text-color)', textAlign: 'center', borderRadius: '6px', padding: '5px 0',
                    position: 'absolute', zIndex: 1, bottom: '125%', left: '50%', marginLeft: '-60px',
                    opacity: 0, transition: 'opacity 0.3s'
                  }}>
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </SwipeableDrawer>
      {selectedPreorderProduct && (
        <PreorderModal
          isOpen={isPreorderModalOpen}
          onRequestClose={() => setIsPreorderModalOpen(false)}
          productDetails={selectedPreorderProduct} // Pass the whole object
        />
      )}
    </>
  );
};

export default Cart;
