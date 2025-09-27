const express = require('express');
const sanityClient = require('@sanity/client');
const sanityClient = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');
const axios = require('axios');

// --- Service Configuration ---
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';

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
    const canonicalProducts = sanityProducts.map(p => ({
      canonicalProductId: p._id,
      preview: {
        title: p.name,
        image: p.image ? urlFor(p.image[0]).width(400).url() : '/default-product-image.png',
        rating: 4.5, // Placeholder rating
        minPrice: p.price,
        bestProvider: "SnacksCo", // Hardcoded for now, as this is the Sanity provider
        eta: "15-25 min", // Placeholder ETA
        originSummary: ["SnacksCo"],
        slug: p.slug?.current,
        details: p.details,
      },
      reason: "Freshly sourced from our catalog!", // Generic reason
      meta: {
        generatedBy: "sanity-connector",
        confidence: 1.0,
      }
    }));

    // 3. Push data to the orchestrator
    console.log(`Pushing ${canonicalProducts.length} products to the orchestrator...`);
    const ingestionPayload = {
      provider: 'sanity',
      products: canonicalProducts,
    };

    const response = await axios.post(`${ORCHESTRATOR_URL}/api/v1/ingest/provider-data`, ingestionPayload);
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