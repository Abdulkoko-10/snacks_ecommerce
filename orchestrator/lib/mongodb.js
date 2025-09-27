const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined. Database functionality will be disabled.');
  // Create a promise that resolves to null if the URI is not set.
  clientPromise = Promise.resolve(null);
} else {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
}

// Export a promise that resolves to the client, or null if connection fails.
// This prevents unhandled promise rejections from crashing the app.
module.exports = clientPromise.catch(err => {
  console.error("MongoDB connection failed:", err.message);
  if (process.env.NODE_ENV === 'development') {
    // If in dev, clear the global cache so the next request can try to connect again.
    global._mongoClientPromise = null;
  }
  return null; // Resolve with null so API calls can handle the failure gracefully.
});