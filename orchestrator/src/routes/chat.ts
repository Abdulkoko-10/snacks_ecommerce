import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/message', async (req, res) => {
  const { text, threadId } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const newThreadId = threadId || uuidv4();
  res.setHeader('X-Thread-Id', newThreadId);

  // Return a simple, hardcoded response to test the routing
  res.status(200).json({
    fullText: `Hello from the orchestrator! You said: "${text}"`,
    recommendations: [],
  });
});

export default router;