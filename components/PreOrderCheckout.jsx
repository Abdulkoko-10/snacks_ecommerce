// components/PreOrderCheckout.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateContext } from '../context/StateContext';
import { urlFor } from '../lib/client'; // For images
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import { AiOutlineArrowLeft } from 'react-icons/ai'; // Example icon

const PreOrderCheckout = () => {
  const router = useRouter(); // Already exists
  const { cartItems, totalPrice, totalQuantities, setCartItems, setTotalPrice, setTotalQuantities } = useStateContext();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) { // Clear error when user starts typing
        setFormErrors(prev => ({...prev, [name]: null}));
    }
  };

  const validateShippingForm = () => {
    const errors = {};
    if (!shippingDetails.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!shippingDetails.street.trim()) errors.street = 'Street address is required.';
    if (!shippingDetails.city.trim()) errors.city = 'City is required.';
    if (!shippingDetails.postalCode.trim()) errors.postalCode = 'Postal code is required.';
    if (!shippingDetails.country.trim()) errors.country = 'Country is required.';
    // Add more specific validation as needed (e.g., phone number format)
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    // Redirect if cart is empty or user is not signed in
    if (isLoaded && !isSignedIn) {
      toast.error('Please sign in to proceed with your pre-order.');
      router.push('/'); // Or to sign-in page
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Add items to pre-order.');
      router.push('/');
    }
  }, [cartItems, router, isSignedIn, isLoaded]);

  const handleConfirmPreOrder = async () => {
    if (!validateShippingForm()) {
        toast.error('Please fill in all required shipping details.');
        return;
    }
    if (!isSignedIn) {
      toast.error('You must be signed in to confirm the pre-order.');
      return;
    }
    setIsLoading(true);
    toast.loading('Processing your pre-order...');

    try {
      const response = await fetch('/api/createPreOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({ // Ensure structure matches API expectations
            _id: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image // Send what's needed for schema, API will pick relevant parts
          })),
          totalPrice,
          shippingAddress: shippingDetails, // Add shipping details to payload
        }),
      });

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success('Pre-order placed successfully!');
        // Clear cart
        setCartItems([]);
        setTotalPrice(0);
        setTotalQuantities(0);
        // Redirect to a success page or trigger email confirmation step next
        router.push('/success?pre-order=true'); // Or a dedicated pre-order success page
        // Plan step 5 (user email) and 6 (admin notification) are handled by API or next steps
      } else {
        throw new Error(result.error || 'Failed to place pre-order.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (!isLoaded || (!isSignedIn && isLoaded)) {
    return <div className="loading-container" style={{textAlign: 'center', padding: '50px'}}>Loading user information...</div>;
  }

  if (cartItems.length === 0) {
    return <div className="empty-cart-message" style={{textAlign: 'center', padding: '50px'}}>Your cart is empty.</div>;
  }

  // Basic styling, assuming global styles provide .btn, .product-container etc.
  // Will need to be adapted to the "liquid glass design system"
  return (
    <div className="pre-order-checkout-container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto', position: 'relative' }}>
      {/* Back button - positioned top-left or similar */}
      <button
        onClick={() => router.push('/')}
        title="Go Back"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem', // Adjust size as needed
          color: 'var(--text-color)' // Use theme color
        }}
        aria-label="Go back to homepage"
      >
        <AiOutlineArrowLeft />
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-color)' }}>Confirm Your Pre-Order</h2>

      {/* Shipping Details Form */}
      <div className="shipping-details-form" style={{ marginTop: '30px', marginBottom: '30px', padding: '20px', background: 'var(--secondary-background-color)', borderRadius: '8px' }}>
        <h3 style={{ color: 'var(--text-color)', marginBottom: '20px', borderBottom: '1px solid var(--text-color)', paddingBottom: '10px' }}>Shipping Information</h3>
        {Object.keys(shippingDetails).map((key) => (
          <div key={key} style={{ marginBottom: '15px' }}>
            <label htmlFor={key} style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()} {/* Auto-format label */}
              {['fullName', 'street', 'city', 'postalCode', 'country'].includes(key) && <span style={{color: 'red'}}>*</span>}
            </label>
            <input
              type={key === 'phoneNumber' ? 'tel' : 'text'}
              id={key}
              name={key}
              value={shippingDetails[key]}
              onChange={handleShippingChange}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${formErrors[key] ? 'red' : 'var(--text-color)'}`, background: 'var(--background-color)', color: 'var(--text-color)' }}
            />
            {formErrors[key] && <p style={{color: 'red', fontSize: '0.8em', marginTop: '5px'}}>{formErrors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="product-container" style={{ marginBottom: '30px' }}>
        {cartItems.map((item) => (
          <div className="product" key={item._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', background: 'var(--secondary-background-color)', borderRadius: '8px' }}>
            <Image
              src={urlFor(item.image[0]).width(100).height(100).url()}
              alt={item.name}
              width={100}
              height={100}
              className="cart-product-image" // Ensure this class provides appropriate styling
              style={{ borderRadius: '4px', marginRight: '20px' }}
            />
            <div className="item-desc" style={{ flexGrow: 1 }}>
              <h5 style={{ color: 'var(--text-color)', marginBottom: '5px' }}>{item.name}</h5>
              <p style={{ color: 'var(--text-color)', fontSize: '0.9em' }}>Quantity: {item.quantity}</p>
            </div>
            <h4 style={{ color: 'var(--text-color)' }}>${(item.price * item.quantity).toFixed(2)}</h4>
          </div>
        ))}
      </div>

      <div className="total" style={{ textAlign: 'right', marginBottom: '30px' }}>
        <h3 style={{ color: 'var(--text-color)' }}>Subtotal: ${totalPrice.toFixed(2)}</h3>
        <p style={{ color: 'var(--text-color)' }}>Total Items: {totalQuantities}</p>
      </div>

      <div className="btn-container" style={{ textAlign: 'center', marginTop: '40px' }}> {/* Added marginTop for spacing */}
        {/* Existing Confirm button */}
        <button
          type="button"
          className="btn" // Assuming .btn class provides base styling
          onClick={handleConfirmPreOrder}
          disabled={isLoading || cartItems.length === 0}
          style={{
            padding: '15px 30px',
            fontSize: '1.1em',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Processing...' : 'Confirm Pre-Order & Notify Me'}
        </button>
      </div>
      <style jsx>{`
        // Add specific styles for PreOrderCheckout here if not covered by global/theme
        // Example: ensure it adapts to liquid glass design and theme modes.
        // This might involve using CSS variables defined in globals.css for colors, fonts, etc.
        .pre-order-checkout-container {
          background: var(--background-color); // Example of theme variable
          border-radius: 15px; // Example for liquid glass
          box-shadow: 0 0 20px var(--shadow-color); // Example
        }
      `}</style>
    </div>
  );
};

export default PreOrderCheckout;
