import express from 'express';
import chatRouter from './routes/chat';
import searchRouter from './routes/search';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Main API router
const apiRouter = express.Router();

// Register the specific routers for different functionalities
apiRouter.use('/chat', chatRouter);
apiRouter.use('/search', searchRouter);

// All API v1 routes will be handled by this router
app.use('/api/v1', apiRouter);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).send('Orchestrator is healthy!');
});

// Vercel handles the server listening, so we just export the app.
export default app;