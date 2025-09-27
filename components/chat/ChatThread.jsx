import React, { Fragment } from 'react';
import styled from '@emotion/styled';
import { SignIn } from '@clerk/nextjs';
import ChatBubble from './ChatBubble';
import RecommendationCarousel from '../RecommendationCarousel';

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


const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-top: 10px;
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
        {messages.map((message) => {
          if (message.type === 'auth') {
            return (
              <Fragment key={message.id}>
                <ChatBubble message={message} />
                <AuthWrapper>
                  <SignIn signUpUrl="/sign-up" redirectUrl="/chat" />
                </AuthWrapper>
              </Fragment>
            );
          }

          const recommendations = recommendationsByMessageId[message.id];
          const hasRecommendations = recommendations && recommendations.length > 0;

          return (
            <Fragment key={message.id}>
              <ChatBubble
                message={message}
              />
              {message.role === 'assistant' && hasRecommendations && (
                <RecommendationCarousel recommendations={recommendations} />
              )}
            </Fragment>
          );
        })}
      </ScrollableArea>
    </ThreadContainer>
  );
};

export default ChatThread;
