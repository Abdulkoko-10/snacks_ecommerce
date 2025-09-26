import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // Return a simple, hardcoded response to test the routing
  // This removes all dependencies on connectors and the database
  res.status(200).json([
    {
      "message": "Hello from the search endpoint!"
    }
  ]);
});

export default router;