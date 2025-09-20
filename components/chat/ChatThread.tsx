import React from 'react';
import { ChatMessage, ChatRecommendationCard } from '@fd/schemas/chat';
import ChatBubble from './ChatBubble';
import ChatRecommendationCardComponent from './ChatRecommendationCard';

interface ChatThreadProps {
  messages: ChatMessage[];
  recommendations: Record<string, ChatRecommendationCard[]>;
}

const ChatThread = ({ messages, recommendations }: ChatThreadProps) => {
  return (
    <div className="chat-thread">
      {messages.map((message) => (
        <div key={message.id}>
          <ChatBubble message={message} />
          {recommendations[message.id] && (
            <div className="recommendations-container">
              {recommendations[message.id].map((card) => (
                <ChatRecommendationCardComponent key={card.canonicalProductId} card={card} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatThread;
