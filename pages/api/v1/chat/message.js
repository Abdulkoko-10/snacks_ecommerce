// We'll import the JSDoc types to help with IDE intellisense and clarity.
// Although it doesn't enforce anything at runtime, it's good practice.
// eslint-disable-next-line no-unused-vars
import { ChatMessage, ChatRecommendationPayload } from '../../../../schemas/chat';

/**
 * Handles incoming chat messages.
 * For now, it returns a hardcoded mock response.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse<({ message: ChatMessage, recommendationPayload: ChatRecommendationPayload | null }) | { error: string }>} res
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const assistantMessageId = `asst_msg_${Date.now()}`;

  /** @type {ChatMessage} */
  const assistantMessage = {
    id: assistantMessageId,
    role: 'assistant',
    text: "I've found a few recommendations you might like based on your message!",
    createdAt: new Date().toISOString(),
  };

  /** @type {ChatRecommendationPayload} */
  const recommendationPayload = {
    messageId: assistantMessageId,
    recommendations: [
      {
        canonicalProductId: 'fd::pizza::uuid123',
        preview: {
          title: 'Margherita Pizza',
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2938&auto=format&fit=crop',
          rating: 4.4,
          minPrice: 6.95,
          bestProvider: 'DoorDash',
          eta: '18-25 min',
          originSummary: ['UberEats', 'DoorDash'],
        },
        reason: "A classic choice, highly rated for its simplicity and flavor.",
      },
      {
        canonicalProductId: 'fd::burger::uuid456',
        preview: {
          title: 'Classic Cheeseburger',
          image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=2938&auto=format&fit=crop',
          rating: 4.7,
          minPrice: 8.50,
          bestProvider: 'UberEats',
          eta: '20-30 min',
          originSummary: ['Grubhub', 'UberEats'],
        },
        reason: 'A highly-rated classic that is popular in your area.',
      },
      {
        canonicalProductId: 'fd::sushi::uuid789',
        preview: {
          title: 'Spicy Tuna Roll',
          image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2940&auto=format&fit=crop',
          rating: 4.8,
          minPrice: 11.00,
          bestProvider: 'Sushi Place',
          eta: '25-35 min',
          originSummary: ['Postmates', 'Sushi Place'],
        },
        reason: 'A popular choice for those who enjoy a bit of spice.',
      },
      {
        canonicalProductId: 'fd::salad::uuid101',
        preview: {
          title: 'Caesar Salad',
          image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=2940&auto=format&fit=crop',
          rating: 4.2,
          minPrice: 9.75,
          bestProvider: 'Greenery Salads',
          eta: '15-20 min',
          originSummary: ['DoorDash', 'Greenery Salads'],
        },
        reason: 'A healthy and refreshing option, available for quick delivery.',
      },
      {
        canonicalProductId: 'fd::taco::uuid112',
        preview: {
          title: 'Carne Asada Tacos',
          image: 'https://images.unsplash.com/photo-1599974579605-2b827a317878?q=80&w=2892&auto=format&fit=crop',
          rating: 4.9,
          minPrice: 4.50,
          bestProvider: 'Taco Town',
          eta: '20-25 min',
          originSummary: ['UberEats', 'Taco Town'],
        },
        reason: 'Authentic and flavorful, a top-rated choice for Mexican food lovers.',
      },
      {
        canonicalProductId: 'fd::ramen::uuid131',
        preview: {
          title: 'Tonkotsu Ramen',
          image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=2940&auto=format&fit=crop',
          rating: 4.6,
          minPrice: 14.00,
          bestProvider: 'Ramen House',
          eta: '30-40 min',
          originSummary: ['Grubhub', 'Ramen House'],
        },
        reason: 'A rich and savory broth that is perfect for a comforting meal.',
      },
    ],
  };

  res.status(200).json({ message: assistantMessage, recommendationPayload });
}
