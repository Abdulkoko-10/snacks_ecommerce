import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBubble from '../../../components/chat/ChatBubble';
import { ChatMessage } from '@fd/schemas/chat';

describe('ChatBubble', () => {
  it('renders a user message correctly', () => {
    const message: ChatMessage = {
      id: '1',
      role: 'user',
      text: 'Hello, world!',
      createdAt: new Date().toISOString(),
    };

    render(<ChatBubble message={message} />);

    const bubble = screen.getByText('Hello, world!').parentElement;
    expect(bubble).toHaveClass('chat-bubble user');
  });

  it('renders an assistant message correctly', () => {
    const message: ChatMessage = {
      id: '2',
      role: 'assistant',
      text: 'Hi there!',
      createdAt: new Date().toISOString(),
    };

    render(<ChatBubble message={message} />);

    const bubble = screen.getByText('Hi there!').parentElement;
    expect(bubble).toHaveClass('chat-bubble assistant');
  });
});
