// Use require for runtime dependencies
const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const { CanonicalProductSchema } = require('@fd/schemas');

// Use import type for type-only imports, which are erased at compile time
import type { Express, Request, Response } from 'express';
import type { Db, Collection } from 'mongodb';
import type { CanonicalProduct } from '@fd/schemas';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI || !MONGODB_DB_NAME) {
  console.error("MongoDB connection details are not defined in environment variables.");
  process.exit(1);
}

let db: Db;

/**
 * Connects to the MongoDB database.
 */
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log(`Successfully connected to database: ${db.databaseName}`);

    // Ensure a text index exists for searching
    const productsCollection = db.collection('products');
    await productsCollection.createIndex({ title: "text", description: "text" });
    console.log("Text index created on 'products' collection.");

  } catch (error) {
    console.error("Failed to connect to the database or create index", error);
    process.exit(1);
  }
}

/**
 * API Endpoint: /api/v1/ingest/provider-data
 * Method: POST
 * Description: Receives product data from a connector, validates it,
 *              and upserts it into the 'products' collection.
 */
app.post('/api/v1/ingest/provider-data', async (req: Request, res: Response) => {
  const productData = req.body;

  // 1. Validate the incoming data against the schema
  const validationResult = CanonicalProductSchema.safeParse(productData);
  if (!validationResult.success) {
    return res.status(400).json({
      message: "Invalid product data format.",
      errors: validationResult.error.errors,
    });
  }

  const validatedProduct: CanonicalProduct = validationResult.data;

  try {
    const productsCollection: Collection<CanonicalProduct> = db.collection<CanonicalProduct>('products');

    // 2. Upsert the data into the database
    const result = await productsCollection.updateOne(
      { canonicalProductId: validatedProduct.canonicalProductId },
      { $set: validatedProduct },
      { upsert: true }
    );

    console.log(`Upserted document with ID: ${validatedProduct.canonicalProductId}. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);

    res.status(200).json({
      message: "Product data ingested successfully.",
      productId: validatedProduct.canonicalProductId,
      operation: result.upsertedId ? 'inserted' : 'updated',
    });

  } catch (error) {
    console.error("Failed to ingest product data:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});


/**
 * API Endpoint: /api/v1/search
 * Method: GET
 * Description: Searches for products using a text index.
 * Query Params: q (string) - The search term.
 */
app.get('/api/v1/search', async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: "A search query 'q' is required." });
  }

  try {
    const productsCollection: Collection<CanonicalProduct> = db.collection<CanonicalProduct>('products');

    // Use the text index to search. Sort by relevance score.
    const searchResult = await productsCollection.find(
      { $text: { $search: q } },
      { projection: { score: { $meta: "textScore" } } }
    ).sort({ score: { $meta: "textScore" } }).toArray();


    res.status(200).json(searchResult);

  } catch (error) {
    console.error("Failed to perform search:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Orchestrator service is running!');
});

// Start the server after connecting to the database
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});