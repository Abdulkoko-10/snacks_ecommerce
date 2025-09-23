import express from 'express';
import axios from 'axios';
const app = express();
const port = process.env.PORT || 3001;
const connectorUrl = process.env.CONNECTOR_URL || 'http://localhost:3002';
app.use(express.json());
// New search endpoint
app.get('/api/v1/search', async (req, res) => {
    const { q, location } = req.query;
    if (!q || !location) {
        return res.status(400).json({ error: 'Missing required query parameters: "q" and "location"' });
    }
    try {
        console.log(`Forwarding search request to connector: q=${q}, location=${location}`);
        // Call the connector's search endpoint
        const response = await axios.get(`${connectorUrl}/search`, {
            params: { q, location },
        });
        // For now, just proxy the response from the connector
        res.status(response.status).json(response.data);
    }
    catch (error) {
        console.error('Error calling connector service:', error.message);
        // Forward the error status and message if available
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Internal server error in orchestrator' });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'orchestrator' });
});
app.listen(port, () => {
    console.log(`Orchestrator service listening on port ${port}`);
});
export default app;
