import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatBubble from '../../../components/chat/ChatBubble';

// Mock the recommendation card as it's not the focus of this test
jest.mock('../../../components/chat/ChatRecommendationCard', () => () => <div data-testid="mock-rec-card" />);

describe('ChatBubble', () => {
  it('renders a user message correctly', () => {
    const userMessage = {
      id: '1',
      role: 'user',
      text: 'Hello, this is a user message.',
      createdAt: new Date().toISOString(),
    };

    render(<ChatBubble message={userMessage} />);

    expect(screen.getByText('Hello, this is a user message.')).toBeInTheDocument();

    const bubbleWrapper = screen.getByTestId('chat-bubble-wrapper');
    expect(bubbleWrapper).toHaveClass('user');
    expect(bubbleWrapper).not.toHaveClass('assistant');
  });

  it('renders an assistant message correctly', () => {
    const assistantMessage = {
      id: '2',
      role: 'assistant',
      text: 'Hello, this is an assistant message.',
      createdAt: new Date().toISOString(),
    };

    render(<ChatBubble message={assistantMessage} />);

    expect(screen.getByText('Hello, this is an assistant message.')).toBeInTheDocument();

    const bubbleWrapper = screen.getByTestId('chat-bubble-wrapper');
    expect(bubbleWrapper).toHaveClass('assistant');
    expect(bubbleWrapper).not.toHaveClass('user');
  });

  it('renders recommendations when provided for an assistant message', () => {
    const assistantMessage = {
      id: '3',
      role: 'assistant',
      text: 'Here are some recommendations.',
      createdAt: new Date().toISOString(),
    };
    const recommendations = [
      { canonicalProductId: '1' },
      { canonicalProductId: '2' },
    ];

    render(<ChatBubble message={assistantMessage} recommendations={recommendations} />);

    expect(screen.getByText('Here are some recommendations.')).toBeInTheDocument();
    const recommendationCards = screen.getAllByTestId('mock-rec-card');
    expect(recommendationCards).toHaveLength(2);
  });
});
