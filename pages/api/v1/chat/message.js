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

  // In the future, we'd get the user's message from req.body
  // const { userId, text } = req.body;

  // Create a unique ID for the assistant's message
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
          // Using a placeholder image from a free source
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2938&auto=format&fit=crop',
          rating: 4.4,
          minPrice: 6.95,
          bestProvider: 'DoorDash',
          eta: '18-25 min',
          originSummary: ['UberEats', 'DoorDash'],
        },
        reason:
          "You liked 'Pepperoni Classic' recently — this is a similar, cheaper option with fast delivery.",
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
        reason:
          'A highly-rated classic that is popular in your area.',
      },
    ],
  };

  res.status(200).json({ message: assistantMessage, recommendationPayload });
}
