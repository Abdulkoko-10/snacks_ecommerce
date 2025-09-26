const express = require('express');
const sanityClient = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');

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

// --- Product Fetching Endpoint ---
app.get('/products', async (req, res) => {
  try {
    // This query is refactored from the original `message.js`
    const productsQuery = `*[_type == "product" && defined(slug.current)]{_id, name, image, price, details, slug} | order(_createdAt desc)`;
    const sanityProducts = await client.fetch(productsQuery);

    // --- Data Transformation ---
    // Transform the raw Sanity product data into the unified CanonicalProduct schema
    const canonicalProducts = sanityProducts.map(p => ({
      // This structure matches the CanonicalProduct schema defined in @fd/schemas
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

    res.status(200).json(canonicalProducts);
  } catch (error) {
    console.error('Error fetching products from Sanity:', error);
    res.status(500).json({ error: 'Failed to fetch products from Sanity.' });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Sanity Connector service listening on port ${PORT}`);
});