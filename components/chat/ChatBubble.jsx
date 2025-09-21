import React from 'react';
import styled from '@emotion/styled';
import ChatRecommendationCard from './ChatRecommendationCard';

const BubbleWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
  animation: fadeIn 0.3s ease-out;

  &.assistant {
    justify-content: flex-start;
  }

  &.user {
    justify-content: flex-end;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const BubbleAndCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 90%; /* Max width for the entire bubble + recommendations block */

  .user & {
    align-items: flex-end;
  }

  .assistant & {
    align-items: flex-start;
  }
`;

const Bubble = styled.div`
  max-width: 75%;
  padding: 12px 18px;
  border-radius: 20px;
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  box-shadow: inset 0 1px 1px 0 var(--glass-inner-highlight-color),
              inset 0 -1px 1px 0 var(--glass-inner-shadow-color),
              0 4px 8px -2px var(--glass-box-shadow-color);
  color: var(--text-color);
  word-wrap: break-word;

  .assistant & {
    border-bottom-left-radius: 5px;
  }

  .user & {
    border-bottom-right-radius: 5px;
    background: rgba(var(--accent-color-rgb-values, 255, 165, 0), 0.2);
  }
`;

const BubbleText = styled.p`
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 1rem;
`;

const RecommendationsCarousel = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 15px; /* For scrollbar visibility */
  width: 100%;

  /* Custom scrollbar for a sleeker look */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--glass-edge-highlight-color);
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--accent-color);
  }
`;

/**
 * Renders a single chat message bubble and any associated recommendation cards.
 * @param {{
 *   message: import('../../schemas/chat').ChatMessage,
 *   recommendations?: import('../../schemas/chat').ChatRecommendationCard[]
 * }} props
 */
const ChatBubble = ({ message, recommendations }) => {
  const { role, text } = message;
  const isUser = role === 'user';
  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <BubbleWrapper data-testid="chat-bubble-wrapper" className={isUser ? 'user' : 'assistant'}>
      <BubbleAndCardsContainer>
        <Bubble>
          <BubbleText>{text}</BubbleText>
        </Bubble>
        {hasRecommendations && (
          <RecommendationsCarousel>
            {recommendations.map((card) => (
              <ChatRecommendationCard key={card.canonicalProductId} card={card} />
            ))}
          </RecommendationsCarousel>
        )}
      </BubbleAndCardsContainer>
    </BubbleWrapper>
  );
};

export default ChatBubble;
