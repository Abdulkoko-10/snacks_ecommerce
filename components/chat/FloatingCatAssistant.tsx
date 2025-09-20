import React from 'react';

interface FloatingCatAssistantProps {
  onClick: () => void;
}

const FloatingCatAssistant = ({ onClick }: FloatingCatAssistantProps) => {
  return (
    <div className="floating-cat-assistant" onClick={onClick}>
      {/* Placeholder for cat assistant image */}
      <span>🐱</span>
    </div>
  );
};

export default FloatingCatAssistant;
