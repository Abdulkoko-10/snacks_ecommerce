import React from 'react';
import styled from '@emotion/styled';
import ChatBubble from './ChatBubble';

const ThreadContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;

  /* Add padding to the bottom to avoid the input bar */
  padding-bottom: 95px;

  @media screen and (max-width: 800px) {
    padding-top: 70px; /* Add padding to prevent content from going under the toggle button */
    padding-bottom: 85px;
  }
`;

const ScrollableArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

/**
 * Renders a scrollable thread of chat messages and their recommendations.
 * @param {{
 *   messages: import('../../schemas/chat').ChatMessage[],
 *   recommendationsByMessageId?: Record<string, import('../../schemas/chat').ChatRecommendationCard[]>
 * }} props
 */
const ChatThread = ({ messages = [], recommendationsByMessageId = {} }) => {
  return (
    <ThreadContainer>
      <ScrollableArea>
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            recommendations={recommendationsByMessageId[message.id]}
          />
        ))}
      </ScrollableArea>
    </ThreadContainer>
  );
};

export default ChatThread;
