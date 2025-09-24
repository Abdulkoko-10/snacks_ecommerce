// This API route will act as a proxy to the orchestrator service.
// This is a common pattern (Backend for Frontend, or BFF) to avoid CORS issues
// and to hide the internal architecture from the browser.

export default async function handler(req, res) {
  // Get the orchestrator URL from environment variables.
  // Note: This is a server-side-only environment variable.
  const orchestratorUrl = process.env.ORCHESTRATOR_URL;

  if (!orchestratorUrl) {
    console.error("ORCHESTRATOR_URL environment variable not set.");
    return res.status(500).json({ error: 'Internal server configuration error.' });
  }

  try {
    // Fetch data from the orchestrator's /products endpoint.
    const response = await fetch(`${orchestratorUrl}/api/v1/products`);

    if (!response.ok) {
      // If the orchestrator returns an error, pass it along.
      const errorData = await response.text();
      console.error(`Error from orchestrator: ${response.status} ${errorData}`);
      return res.status(response.status).json({ error: `Failed to fetch data from orchestrator: ${errorData}` });
    }

    const data = await response.json();

    // Send the data from the orchestrator back to the frontend client.
    res.status(200).json(data);

  } catch (error) {
    console.error("Error fetching from orchestrator:", error);
    res.status(500).json({ error: 'Failed to connect to the orchestrator service.' });
  }
}
