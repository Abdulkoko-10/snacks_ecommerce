// This script migrates product data from the legacy Sanity database
// to the new MongoDB collection used by the orchestrator.

require('dotenv').config({ path: '../.env.local' }); // Load env vars from the root .env file

const { createClient } = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');
const { MongoClient } = require('mongodb');

// --- Configuration ---
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ise1lfsl';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const SANITY_API_VERSION = '2022-03-10';
const SANITY_TOKEN = process.env.NEXT_PUBLIC_SANITY_TOKEN;

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || 'food-discovery-orchestrator';
const MONGO_COLLECTION_NAME = 'canonical_products';

// --- Sanity Client ---
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_TOKEN,
  useCdn: false,
});
const builder = imageUrlBuilder(sanityClient);
const urlFor = (source) => builder.image(source);


// --- Main Migration Logic ---
async function migrate() {
  console.log('Starting migration from Sanity to MongoDB...');

  let mongoClient;
  try {
    // 1. Connect to MongoDB
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db(MONGO_DB_NAME);
    const collection = db.collection(MONGO_COLLECTION_NAME);
    console.log('Successfully connected to MongoDB.');

    // 2. Fetch all products from Sanity
    const productsQuery = `*[_type == "product" && defined(slug.current)]`;
    const sanityProducts = await sanityClient.fetch(productsQuery);
    console.log(`Fetched ${sanityProducts.length} products from Sanity.`);
    if (sanityProducts.length === 0) {
      console.log('No products to migrate. Exiting.');
      return;
    }

    // 3. Transform data to CanonicalProduct schema
    const canonicalProducts = sanityProducts.map(p => ({
      canonicalProductId: p._id,
      preview: {
        title: p.name,
        image: p.image ? urlFor(p.image[0]).width(400).url() : '/default-product-image.png',
        rating: 4.5, // Placeholder
        minPrice: p.price,
        bestProvider: "SnacksCo",
        eta: "15-25 min",
        originSummary: ["SnacksCo"],
        slug: p.slug?.current,
        details: p.details,
      },
      reason: "Freshly sourced from our catalog!",
      meta: {
        provider: 'sanity', // Set the provider explicitly
        providerProductId: p._id,
        generatedBy: "migration-script",
        confidence: 1.0,
      }
    }));
    console.log('Transformed products to canonical schema.');

    // 4. Upsert data into MongoDB
    const operations = canonicalProducts.map(product => ({
      updateOne: {
        filter: { 'meta.provider': 'sanity', 'meta.providerProductId': product.canonicalProductId },
        update: { $set: { ...product, lastIngestedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        upsert: true,
      },
    }));

    console.log('Starting bulk write operation to MongoDB...');
    const result = await collection.bulkWrite(operations);
    console.log('Migration complete!');
    console.log(`- Matched ${result.matchedCount} existing documents.`);
    console.log(`- Inserted ${result.upsertedCount} new documents.`);
    console.log(`- Modified ${result.modifiedCount} existing documents.`);

  } catch (error) {
    console.error('An error occurred during migration:', error);
    process.exit(1);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed.');
    }
  }
}

// Run the migration
migrate();