import { connectToDatabase } from './mongodb';

/**
 * Fetches all products from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of products.
 */
export async function getProducts() {
  const { db } = await connectToDatabase();
  const products = await db.collection('products').find({}).toArray();

  // The Sanity export uses `_id` with a string value like `image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg`.
  // The frontend components expect this as part of the product data.
  // We also need to ensure the `slug` field is present and correct.
  const sanitizedProducts = products.map((product) => {
    return {
      ...product,
      // Ensure slug exists and has a 'current' property, matching Sanity's structure
      slug: product.slug || { current: product._id.toString() },
    };
  });

  return sanitizedProducts;
}

/**
 * Fetches a single product by its slug.
 * @param {string} slug The slug of the product to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the product object or null if not found.
 */
export async function getProductBySlug(slug) {
  const { db } = await connectToDatabase();
  // The slug field in the database is an object like { current: "the-slug" }
  const product = await db.collection('products').findOne({ 'slug.current': slug });

  if (!product) {
    return null;
  }

  return {
      ...product,
      slug: product.slug || { current: product._id.toString() },
  };
}
