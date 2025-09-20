import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatPage from '../../../pages/chat';
import { ChatMessage, ChatRecommendationPayload } from '@fd/schemas/chat';
import { StateContext } from '../../../context/StateContext';

// Mock Clerk's useAuth hook
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ userId: 'user_123' }),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

global.fetch = jest.fn();

describe('ChatPage Integration Test', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('sends a message and renders the response with recommendations', async () => {
    const mockAssistantMessage: ChatMessage = {
      id: 'msg_456',
      role: 'assistant',
      text: 'Here are some recommendations!',
      createdAt: new Date().toISOString(),
    };
    const mockRecommendations: ChatRecommendationPayload['recommendations'] = [
      {
        canonicalProductId: 'fd::pizza::uuid123',
        preview: {
          title: 'Margherita Pizza',
          image: 'https://example.com/pizza.jpg',
          rating: 4.4,
          minPrice: 6.95,
          bestProvider: 'Doordash',
          eta: '18-25 min',
          originSummary: ['UberEats', 'Doordash'],
        },
        reason: 'A classic choice.',
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: mockAssistantMessage,
        recommendations: mockRecommendations,
      }),
    });

    render(
      <StateContext>
        <ChatPage />
      </StateContext>
    );

    // Type a message and send it
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
      target: { value: 'I want pizza' },
    });
    fireEvent.click(screen.getByText('Send'));

    // Wait for the API response and re-render
    await waitFor(() => {
      expect(screen.getByText('Here are some recommendations!')).toBeInTheDocument();
    });

    // Check that the recommendation card is rendered
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('A classic choice.')).toBeInTheDocument();
  });
});
