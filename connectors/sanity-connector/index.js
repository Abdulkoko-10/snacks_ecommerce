const express = require('express');
const sanityClient = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');
const axios = require('axios');

// --- Pre-flight Checks ---
const requiredEnvVars = ['SANITY_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('CRITICAL ERROR: The following required environment variables are not set:');
  missingEnvVars.forEach(varName => console.error(`- ${varName}`));
  console.error('The Sanity connector cannot start without these variables.');
  process.exit(1); // Exit with a failure code
}
// --- End Pre-flight Checks ---

// Helper to construct the base URL for inter-service communication
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000'; // Fallback for local development
};


// --- Sanity Client Configuration ---
// These should be set as environment variables for the connector service
const projectId = process.env.SANITY_PROJECT_ID || 'ise1lfsl';
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = '2022-03-10';
const readToken = process.env.SANITY_TOKEN;

const client = sanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // We want fresh data for a connector
  token: readToken,
});

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

const PORT = process.env.SANITY_CONNECTOR_PORT || 3002;

const app = express();
app.use(express.json());

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Ingestion Trigger Endpoint ---
app.post('/trigger-ingest', async (req, res) => {
  console.log('Ingestion trigger received. Fetching data from Sanity...');
  try {
    // 1. Fetch data from Sanity
    const productsQuery = `*[_type == "product" && defined(slug.current)]{_id, name, image, price, details, slug} | order(_createdAt desc)`;
    const sanityProducts = await client.fetch(productsQuery);
    console.log(`Fetched ${sanityProducts.length} products from Sanity.`);

    // 2. Transform data to the canonical schema
    const canonicalProducts = sanityProducts.map(p => {
      const fetchedAt = new Date().toISOString();
      return {
        canonicalProductId: `sanity::${p._id}`,
        title: p.name,
        images: p.image ? p.image.map(img => urlFor(img).width(400).url()) : ['/default-product-image.png'],
        description: p.details,
        price: {
          amount: p.price,
          currency: 'USD', // Assuming USD, as it's not provided
        },
        rating: 0, // Placeholder
        numRatings: 0, // Placeholder
        tags: [], // Not available from Sanity product schema
        sources: [
          {
            provider: 'sanity',
            providerProductId: p._id,
            price: p.price,
            deliveryEtaMin: null,
            lastFetchedAt: fetchedAt,
          },
        ],
        comments: [], // Reviews are not fetched in this query
        popularityScore: 0, // Placeholder
        lastFetchedAt: fetchedAt,
      };
    });

    // 3. Push data to the orchestrator
    console.log(`Pushing ${canonicalProducts.length} products to the orchestrator...`);
    const ingestionPayload = {
      provider: 'sanity',
      products: canonicalProducts,
    };

    const orchestratorUrl = `${getBaseUrl()}/api/v1/ingest/provider-data`;
    console.log(`Pushing ${canonicalProducts.length} products to the orchestrator at ${orchestratorUrl}...`);
    const ingestionPayload = {
      provider: 'sanity',
      products: canonicalProducts,
    };

    const response = await axios.post(orchestratorUrl, ingestionPayload);
    console.log('Successfully pushed data to orchestrator.', response.data);

    res.status(200).json({
        message: 'Successfully fetched and pushed data to the orchestrator.',
        orchestratorResponse: response.data
    });

  } catch (error) {
    console.error('Error during ingestion process:', error.message);
    res.status(500).json({ error: 'Failed during the ingestion process.' });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Sanity Connector service listening on port ${PORT}`);
});