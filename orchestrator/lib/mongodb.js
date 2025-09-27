const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

let client;
let clientPromise = null;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined. Database functionality will be disabled.');
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    clientPromise = client.connect();
  }
}

module.exports = clientPromise;