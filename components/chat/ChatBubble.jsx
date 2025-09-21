import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

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

const liveHighlight = keyframes`
  0% {
    text-shadow: 0 0 8px rgba(var(--accent-color-rgb-values), 0.7), 0 0 12px rgba(var(--accent-color-rgb-values), 0.5);
    color: var(--accent-color-light);
  }
  100% {
    text-shadow: none;
    color: var(--text-color);
  }
`;

const LiveHighlightSpan = styled.span`
  animation: ${liveHighlight} 1.5s ease-out;
`;


/**
 * Renders a single chat message bubble.
 * @param {{
 *   message: { role: string, text: string, stableText?: string, liveText?: string }
 * }} props
 */
const ChatBubble = ({ message }) => {
  const { role, text, stableText, liveText } = message;
  const isUser = role === 'user';

  // The text prop is now split into stableText and liveText for streaming effect.
  // We fall back to the original `text` prop for non-streamed or history messages.
  const displayText = stableText !== undefined ? stableText : text;

  return (
    <BubbleWrapper data-testid="chat-bubble-wrapper">
      <BubbleContainer className={isUser ? 'user' : 'assistant'}>
        <Bubble className={isUser ? 'user-bubble' : 'assistant-bubble'}>
          <BubbleText>
            {displayText}
            {liveText && <LiveHighlightSpan>{liveText}</LiveHighlightSpan>}
          </BubbleText>
        </Bubble>
      </BubbleContainer>
    </BubbleWrapper>
  );
};

export default ChatBubble;
