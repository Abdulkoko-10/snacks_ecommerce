import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatRecommendationCardComponent from '../../../components/chat/ChatRecommendationCard';
import { ChatRecommendationCard } from '@fd/schemas/chat';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('ChatRecommendationCard', () => {
    it('renders the recommendation card correctly', () => {
        const card: ChatRecommendationCard = {
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
        };

        render(<ChatRecommendationCardComponent card={card} />);

        expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
        expect(screen.getByText('A classic choice.')).toBeInTheDocument();
        expect(screen.getByText('4.4 ★')).toBeInTheDocument();
        expect(screen.getByText('6.95')).toBeInTheDocument();
        expect(screen.getByText('18-25 min')).toBeInTheDocument();

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/product/fd::pizza::uuid123');

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'https://example.com/pizza.jpg');
    });
});
