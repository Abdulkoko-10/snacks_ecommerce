import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import styles from '../styles/PreorderForm.module.css';

const PreorderForm = ({ initialProductName = '' }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    productName: initialProductName,
    quantity: 1,
    street: '',
    city: '',
    postalCode: '',
    country: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' }); // 'success' or 'error'

  useEffect(() => {
    if (initialProductName) {
      setFormData(prev => ({ ...prev, productName: initialProductName }));
    }
  }, [initialProductName]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required.';
    if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1.';
    if (!formData.street.trim()) newErrors.street = 'Street address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required.';
    if (!formData.country.trim()) newErrors.country = 'Country is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: '', message: '' });

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setSubmitStatus({ type: 'error', message: 'You must be logged in to submit a pre-order.' });
      return;
    }

    setIsLoading(true);

    const preorderData = {
      userId: user.id,
      userName: user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.username || 'N/A',
      userEmail: user.primaryEmailAddress?.emailAddress || 'N/A',
      productName: formData.productName,
      // productId: '', // Assuming productId might be derived or added later
      quantity: formData.quantity,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      notes: formData.notes,
    };

    try {
      const response = await fetch('/api/createPreorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preorderData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Pre-order submitted successfully!' });
        // Clear form
        setFormData({
          productName: initialProductName, // Reset to initial or empty
          quantity: 1,
          street: '',
          city: '',
          postalCode: '',
          country: '',
          notes: '',
        });
        setErrors({});
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Failed to submit pre-order. Please try again.' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user && typeof window !== 'undefined') { // Check typeof window to ensure it's client-side
    return <p className={styles.errorMessage}>Please log in to place a pre-order.</p>;
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Pre-order Form</h2>

      {user && (
        <div className={`${styles.userInfo} ${styles.fullWidth}`}>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.username}</p>
          <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="productName">Product Name</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              disabled={!!initialProductName} // Disable if product name is passed as prop
            />
            {errors.productName && <p className={styles.validationError}>{errors.productName}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
            />
            {errors.quantity && <p className={styles.validationError}>{errors.quantity}</p>}
          </div>

          <div className={styles.formGroup}> {/* Placeholder for potential second item in this row if not notes */}
            {/* This div helps maintain grid structure if notes is not here */}
          </div>


          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Shipping Address</label>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="street">Street</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />
            {errors.street && <p className={styles.validationError}>{errors.street}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            {errors.city && <p className={styles.validationError}>{errors.city}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="postalCode">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
            {errors.postalCode && <p className={styles.validationError}>{errors.postalCode}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
            {errors.country && <p className={styles.validationError}>{errors.country}</p>}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            />
            {errors.notes && <p className={styles.validationError}>{errors.notes}</p>}
          </div>

          <div className={styles.fullWidth}>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Pre-order'}
            </button>
          </div>
        </div>
      </form>

      {submitStatus.message && (
        <div className={`${styles.message} ${submitStatus.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
          {submitStatus.message}
        </div>
      )}
    </div>
  );
};

export default PreorderForm;
