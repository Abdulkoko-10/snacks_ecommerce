"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Use require for runtime dependencies
const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const { CanonicalProductSchema } = require('@fd/schemas');
// Load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Middleware to parse JSON bodies
app.use(express.json());
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
if (!MONGODB_URI || !MONGODB_DB_NAME) {
    console.error("MongoDB connection details are not defined in environment variables.");
    process.exit(1);
}
let db;
/**
 * Connects to the MongoDB database.
 */
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new MongoClient(MONGODB_URI);
            yield client.connect();
            db = client.db(MONGODB_DB_NAME);
            console.log(`Successfully connected to database: ${db.databaseName}`);
            // Ensure a text index exists for searching
            const productsCollection = db.collection('products');
            yield productsCollection.createIndex({ title: "text", description: "text" });
            console.log("Text index created on 'products' collection.");
        }
        catch (error) {
            console.error("Failed to connect to the database or create index", error);
            process.exit(1);
        }
    });
}
/**
 * API Endpoint: /api/v1/ingest/provider-data
 * Method: POST
 * Description: Receives product data from a connector, validates it,
 *              and upserts it into the 'products' collection.
 */
app.post('/api/v1/ingest/provider-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productData = req.body;
    // 1. Validate the incoming data against the schema
    const validationResult = CanonicalProductSchema.safeParse(productData);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Invalid product data format.",
            errors: validationResult.error.errors,
        });
    }
    const validatedProduct = validationResult.data;
    try {
        const productsCollection = db.collection('products');
        // 2. Upsert the data into the database
        const result = yield productsCollection.updateOne({ canonicalProductId: validatedProduct.canonicalProductId }, { $set: validatedProduct }, { upsert: true });
        console.log(`Upserted document with ID: ${validatedProduct.canonicalProductId}. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
        res.status(200).json({
            message: "Product data ingested successfully.",
            productId: validatedProduct.canonicalProductId,
            operation: result.upsertedId ? 'inserted' : 'updated',
        });
    }
    catch (error) {
        console.error("Failed to ingest product data:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
}));
/**
 * API Endpoint: /api/v1/search
 * Method: GET
 * Description: Searches for products using a text index.
 * Query Params: q (string) - The search term.
 */
app.get('/api/v1/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "A search query 'q' is required." });
    }
    try {
        const productsCollection = db.collection('products');
        // Use the text index to search. Sort by relevance score.
        const searchResult = yield productsCollection.find({ $text: { $search: q } }, { projection: { score: { $meta: "textScore" } } }).sort({ score: { $meta: "textScore" } }).toArray();
        res.status(200).json(searchResult);
    }
    catch (error) {
        console.error("Failed to perform search:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
}));
app.get('/', (req, res) => {
    res.send('Orchestrator service is running!');
});
// Start the server after connecting to the database
connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
});
