const { MongoClient } = require('mongodb');

let MONGODB_URI = process.env.MONGODB_URI;

let client;
let clientPromise = null;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined. Database functionality will be disabled.');
} else {
  // Ensure required parameters are in the connection string for Atlas
  if (MONGODB_URI.includes('atlas.mongodb.com') && !MONGODB_URI.includes('retryWrites')) {
    const uri = new URL(MONGODB_URI);
    uri.searchParams.set('retryWrites', 'true');
    uri.searchParams.set('w', 'majority');
    MONGODB_URI = uri.toString();
    console.log('MongoDB URI updated with required params for Atlas.');
  }

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

module.exports = clientPromise;