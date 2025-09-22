import React from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';

const ButtonContainer = styled.button`
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--glass-edge-highlight-color);
  background: radial-gradient(ellipse at 50% 0%, var(--glass-sheen-color) 0%, transparent 70%), var(--glass-background-color);
  color: var(--text-color);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1005;
  box-shadow: 0 5px 20px -4px var(--glass-box-shadow-color);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden; /* To keep the image contained */

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 25px -5px var(--glass-box-shadow-color);
  }

  @media screen and (max-width: 800px) {
    display: none; /* Hide the cat on mobile, as the sidebar toggle is now the primary trigger */
  }
`;

/**
 * A floating action button to open the chat.
 * @param {{onClick: () => void}} props
 */
const FloatingCatAssistant = ({ onClick }) => {
  return (
    <ButtonContainer
      onClick={onClick}
      aria-label="Open chat assistant"
    >
      <Image
        src="https://placekitten.com/60/60" // Placeholder image
        alt="Chat assistant cat"
        width={60}
        height={60}
      />
    </ButtonContainer>
  );
};

export default FloatingCatAssistant;
