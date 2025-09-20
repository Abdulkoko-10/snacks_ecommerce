const { MongoClient } = require('mongodb');
const { mockProducts } = require('../lib/mock-data');

// Load the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const dbName = 'FoodDiscovery';
const collectionName = 'products';

async function seedDB() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected correctly to the database server');

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Clear existing documents
    await collection.deleteMany({});
    console.log(`Cleared existing documents from the "${collectionName}" collection.`);

    // Insert the mock data
    // We are not setting a custom _id, we will let MongoDB generate it.
    const result = await collection.insertMany(mockProducts);
    console.log(`${result.insertedCount} documents were inserted successfully.`);

  } catch (err) {
    console.error('An error occurred during the seeding process:', err);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

seedDB();
