const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

let client;
let clientPromise = null;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined. Database functionality will be disabled.');
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect();
      // Prevent unhandled promise rejection from crashing the app
      global._mongoClientPromise.catch(err => {
        console.error("MongoDB connection failed, clearing promise cache.", err.message);
        global._mongoClientPromise = null;
      });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect().catch(err => {
        console.error("MongoDB connection failed.", err.message);
        // Return null or handle appropriately so the app doesn't crash
        return null;
    });
  }
}

module.exports = clientPromise;