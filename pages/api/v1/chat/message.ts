import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// This is a mock implementation of the chat backend to unblock the frontend.
// The real logic will be implemented in the orchestrator service.

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, chatHistory, threadId } = req.body;

  // Generate a new thread ID if one isn't provided
  const newThreadId = threadId || uuidv4();
  res.setHeader('X-Thread-Id', newThreadId);

  // Simple mock response logic
  const mockResponse = {
    fullText: `This is a mock response to your message: "${text}". The real AI-powered chat is not yet connected.`,
    recommendations: [],
  };

  // You can add mock recommendations based on keywords if needed for UI testing
  if (text && text.toLowerCase().includes('pizza')) {
    mockResponse.recommendations.push({
      canonicalProductId: "mock-product-id-1",
      preview: {
        title: "Mock Pizza",
        image: "https://via.placeholder.com/150",
        rating: 4.5,
        minPrice: 12.99,
        bestProvider: "MockProvider",
        eta: "15-25 min",
        originSummary: ["MockProvider"],
      },
      reason: "Because you mentioned pizza, here is a mock pizza suggestion!",
      meta: {
        generatedBy: "mock-backend",
        confidence: 0.99,
      }
    });
  }

  res.status(200).json(mockResponse);
}