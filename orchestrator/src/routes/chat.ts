import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/message', (req, res) => {
  const { text, chatHistory, threadId } = req.body;

  // Generate a new thread ID if one isn't provided
  const newThreadId = threadId || uuidv4();
  res.setHeader('X-Thread-Id', newThreadId);

  // Simple mock response logic
  const mockResponse = {
    fullText: `This is a mock response from the orchestrator to your message: "${text}". The real AI-powered chat is not yet connected.`,
    recommendations: [],
  };

  // You can add mock recommendations based on keywords if needed for UI testing
  if (text && text.toLowerCase().includes('pizza')) {
    mockResponse.recommendations.push({
      canonicalProductId: "mock-product-id-1",
      preview: {
        title: "Orchestrator Mock Pizza",
        image: "https://via.placeholder.com/150",
        rating: 4.5,
        minPrice: 12.99,
        bestProvider: "MockProvider",
        eta: "15-25 min",
        originSummary: ["MockProvider"],
      },
      reason: "Because you mentioned pizza, here is a mock pizza suggestion from the orchestrator!",
      meta: {
        generatedBy: "orchestrator-mock",
        confidence: 0.99,
      }
    });
  }

  res.status(200).json(mockResponse);
});

export default router;