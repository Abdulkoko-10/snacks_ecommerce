// This module provides a MongoDB client instance.
// It's adapted from the original monolithic setup but simplified for a service environment.

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB_NAME || 'food-discovery-orchestrator';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
module.exports = clientPromise;