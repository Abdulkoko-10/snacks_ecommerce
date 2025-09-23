import express, { Request, Response } from 'express';
// No longer importing directly from the connector

const app = express();
const port = process.env.ORCHESTRATOR_PORT || 3001;
const connectorUrl = process.env.CONNECTOR_URL || 'http://localhost:3002';

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Orchestrator is running!');
});

app.get('/api/v1/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    // Call the connector service over HTTP
    const connectorRes = await fetch(`${connectorUrl}/search?q=${encodeURIComponent(query)}`);

    if (!connectorRes.ok) {
      throw new Error(`Connector service returned status ${connectorRes.status}`);
    }

    const results = await connectorRes.json();
    res.json(results);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error calling connector service:", error.message);
    } else {
      console.error("An unknown error occurred while calling the connector.");
    }
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Orchestrator listening on port ${port}`);
});
