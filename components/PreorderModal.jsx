import React, { useEffect } from 'react';
import Modal from 'react-modal';
import styles from '../styles/PreorderModal.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import { PreorderForm } from './PreorderForm'; // Import PreorderForm

// It's good practice to set this for accessibility.
// This should ideally be done once in your app's main entry point (_app.js or similar).
// If running in an environment where document is not available immediately (SSR),
// you might need to defer this or ensure it runs client-side.
if (typeof window !== 'undefined') {
  Modal.setAppElement(document.getElementById('__next') || document.body);
}

const PreorderModal = ({ isOpen, onRequestClose, productDetails }) => {
  // Optional: Add effect to handle body scroll lock when modal is open/closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to reset body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={productDetails?.name ? `Pre-order ${productDetails.name}` : "Pre-order Modal"}
      className={styles.modalContent}
      overlayClassName="ReactModal__Overlay"
      closeTimeoutMS={300} // Matches transition duration
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      // For focus trapping (react-modal usually handles this well by default)
      // You might not need to set `shouldFocusAfterRender` or `shouldReturnFocusAfterClose` explicitly
      // unless you have specific needs.
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>
          {productDetails?.name ? `Pre-order: ${productDetails.name}` : 'Pre-order Item'}
        </h2>
        <button onClick={onRequestClose} className={styles.closeButton} aria-label="Close pre-order modal">
          <AiOutlineClose />
        </button>
      </div>
      <div className={styles.modalBody}>
        <PreorderForm
          initialProductName={productDetails?.name || ''}
          initialProductId={productDetails?._id || null}
          initialQuantity={productDetails?.quantity || 1}
          onPreorderSuccess={() => {
            // Optionally, could show a success message within modal before closing
            // For now, just close the modal. The form itself shows a success message.
            if (onRequestClose) {
              onRequestClose();
            }
          }}
          isInModal={true}
        />
      </div>
      {/* Optional Footer:
      <div className={styles.modalFooter}>
        <button onClick={onRequestClose} className="btn btn-secondary">Cancel</button>
      </div>
      */}
    </Modal>
  );
};

export default PreorderModal;
