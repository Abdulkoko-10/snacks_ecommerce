import React from 'react';
import styled from '@emotion/styled';

const BubbleWrapper = styled.div`
  /* This wrapper can be simplified as it no longer contains a carousel */
  margin-bottom: 5px; /* Reduced margin as carousel will add its own */
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const BubbleContainer = styled.div`
  display: flex;
  /* The parent ScrollableArea in ChatThread now controls the main gap */

  &.assistant {
    justify-content: flex-start;
  }
  &.user {
    justify-content: flex-end;
  }
`;

const Bubble = styled.div`
  padding: 12px 18px;
  border-radius: 20px;
  background: var(--glass-background-color);
  border: 1px solid var(--glass-edge-highlight-color);
  box-shadow: 0 4px 8px -2px var(--glass-box-shadow-color);
  color: var(--text-color);
  word-wrap: break-word;
  box-sizing: border-box;
  width: fit-content;
  max-width: 85%;

  &.assistant-bubble {
    border-bottom-left-radius: 5px;
  }
  &.user-bubble {
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

/**
 * Renders a single chat message bubble.
 * @param {{
 *   message: import('../../schemas/chat').ChatMessage
 * }} props
 */
const ChatBubble = ({ message }) => {
  const { role, text } = message;
  const isUser = role === 'user';

  return (
    <BubbleWrapper data-testid="chat-bubble-wrapper">
      <BubbleContainer className={isUser ? 'user' : 'assistant'}>
        <Bubble className={isUser ? 'user-bubble' : 'assistant-bubble'}>
          <BubbleText>{text}</BubbleText>
        </Bubble>
      </BubbleContainer>
    </BubbleWrapper>
  );
};

export default ChatBubble;
