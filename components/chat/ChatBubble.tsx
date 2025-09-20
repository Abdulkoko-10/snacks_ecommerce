import React from 'react';
import { ChatMessage } from '@fd/schemas/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser ? 'chat-bubble user' : 'chat-bubble assistant';

  return (
    <div className={bubbleClasses}>
      <p>{message.text}</p>
    </div>
  );
};

export default ChatBubble;
