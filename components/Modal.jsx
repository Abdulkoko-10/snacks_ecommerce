import React from 'react';
import styled from '@emotion/styled';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const ModalContent = styled.div`
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 25px 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 8px 32px 0 var(--glass-box-shadow-color);
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-color);
  }
`;

const ModalBody = styled.div`
  margin-bottom: 25px;
  color: var(--text-color-secondary);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
`;

export const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background-color: var(--clr-btn-primary-bg);
    color: var(--clr-btn-primary-text);
    border-color: var(--clr-btn-primary-bg);
    &:hover {
      background-color: var(--clr-btn-primary-hover-bg);
    }
  }

  &.danger {
    background-color: var(--danger-color);
    color: white;
    &:hover {
      opacity: 0.85;
    }
  }

  &.secondary {
    background: var(--glass-background-color);
    border: 1px solid var(--glass-edge-highlight-color);
    color: var(--text-color);
    &:hover {
      background-color: var(--glass-inner-shadow-color);
    }
  }
`;

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{title}</h3>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          {footer}
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default Modal;
