import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessage, ChatRecommendationPayload } from '@fd/schemas/chat';

type ChatApiResponse = {
  message: ChatMessage;
  recommendations?: ChatRecommendationPayload['recommendations'];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatApiResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const assistantMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    text: "Here are some recommendations based on your request!",
    createdAt: new Date().toISOString(),
  };

  const recommendationPayload: ChatRecommendationPayload = {
    messageId: assistantMessage.id,
    recommendations: [
      {
        canonicalProductId: 'fd::pizza::uuid123',
        preview: {
          title: 'Margherita Pizza',
          image: 'https://i.imgur.com/2p5B4jA.jpeg', // Placeholder image
          rating: 4.4,
          minPrice: 6.95,
          bestProvider: 'Doordash',
          eta: '18-25 min',
          originSummary: ['UberEats', 'Doordash'],
        },
        reason: "You liked 'Pepperoni Classic' recently — this is a similar, cheaper option with fast delivery.",
      },
      {
        canonicalProductId: 'fd::burger::uuid456',
        preview: {
            title: 'Classic Cheeseburger',
            image: 'https://i.imgur.com/2p5B4jA.jpeg', // Placeholder image
            rating: 4.8,
            minPrice: 8.50,
            bestProvider: 'UberEats',
            eta: '20-30 min',
            originSummary: ['UberEats', 'JustEat'],
        },
        reason: "A highly-rated classic, perfect if you're looking for a hearty meal.",
      }
    ],
  };

  res.status(200).json({
    message: assistantMessage,
    recommendations: recommendationPayload.recommendations,
  });
}
