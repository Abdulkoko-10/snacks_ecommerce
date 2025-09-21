// This script will connect to the database, fetch all products,
// generate embeddings for them using the Gemini API, and
// update the product records in the database with the new embeddings.

const { MongoClient } = require('mongodb');
const { GoogleGenAI } = require('@google/genai');

// Ensure environment variables are set.
// You can create a .env file in the root of the project.
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
if (!process.env.GEMINI_API_KEY) {
  throw new Error('Please define the GEMINI_API_KEY environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function main() {
  console.log('Starting embedding generation process...');
  try {
    // 1. Connect to the database
    await client.connect();
    console.log('Connected to the database.');

    const db = client.db('food-discovery'); // Use a specific database name
    const collection = db.collection('products'); // Use a specific collection name

    // 2. Fetch all products
    const products = await collection.find({}).toArray();
    console.log(`Found ${products.length} products to process.`);

    // Initialize the Gemini client
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    // 3. For each product, generate and store the embedding
    for (const product of products) {
      // a. Prepare the text for embedding
      const textToEmbed = `Title: ${product.title}\nDescription: ${product.description}\nTags: ${product.tags.join(', ')}`;
      console.log(`\nGenerating embedding for: ${product.title}`);

      // b. Generate the embedding
      const result = await model.embedContent({ contents: [textToEmbed] });
      const embedding = result.embeddings[0];
      console.log(`  - Embedding generated with dimension: ${embedding.values.length}`);

      // c. Update the product record with the new embedding
      await collection.updateOne(
        { _id: product._id },
        { $set: { embedding: embedding.values } }
      );
      console.log(`  - Stored embedding in the database.`);
    }

  } finally {
    // 4. Disconnect from the database
    await client.close();
    console.log('Disconnected from the database.');
  }
  console.log('Embedding generation process complete.');
}

main().catch(console.error);
