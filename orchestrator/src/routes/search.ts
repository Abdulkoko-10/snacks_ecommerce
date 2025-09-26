import { Router } from 'express';
import { search as searchWithGeoapify } from '@fd/geoapify-connector';
import { getEnrichmentData } from '@fd/serpapi-connector';
import { connectToDatabase } from '../lib/mongodb';
import { CanonicalProduct, CanonicalProductSchema } from '@fd/schemas';

const router = Router();
const CACHE_RADIUS_METERS = 5000; // 5km

async function enrichProduct(product: CanonicalProduct) {
  try {
    const enrichmentData = await getEnrichmentData(product);
    if (enrichmentData) {
      const { db } = await connectToDatabase();
      const productsCollection = db.collection<CanonicalProduct>('products');

      const updateData: Partial<CanonicalProduct> = {
        images: [...(product.images || []), ...(enrichmentData.photos || [])],
        comments: [...(product.comments || []), ...(enrichmentData.reviews?.map(r => ({
          id: new Date().toISOString(),
          text: r.text,
          author: r.author_name,
          origin: 'serpapi',
          rating: r.rating,
          createdAt: new Date().toISOString(),
        })) || [])],
        rating: enrichmentData.rating || product.rating,
        numRatings: enrichmentData.user_ratings_total || product.numRatings,
      };

      if(enrichmentData.serpapiPlaceId) {
        updateData.sources = [...(product.sources || []), { provider: 'SerpApi', providerProductId: enrichmentData.serpapiPlaceId, price: 0, lastFetchedAt: new Date().toISOString() }];
      }

      await productsCollection.updateOne(
        { canonicalProductId: product.canonicalProductId },
        { $set: updateData }
      );
      console.log(`Enriched product: ${product.canonicalProductId} with SerpApi`);
    }
  } catch (error) {
    console.error(`Failed to enrich product ${product.canonicalProductId}:`, error);
  }
}

router.get('/', async (req, res) => {
  const { q, lat, lon } = req.query;

  if (!q || !lat || !lon) {
    return res.status(400).json({ error: 'Query parameters "q", "lat", and "lon" are required.' });
  }

  try {
    const query = q as string;
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid "lat" or "lon" parameters.' });
    }

    const { db } = await connectToDatabase();
    const productsCollection = db.collection<CanonicalProduct>('products');

    await productsCollection.createIndex({ location: "2dsphere" });
    await productsCollection.createIndex({ title: "text", description: "text" });

    // MongoDB requires $text search to be the first stage in an aggregation pipeline.
    // We use $geoWithin in a subsequent $match stage to filter by location.
    const pipeline: any[] = [
      {
        $match: {
          $text: { $search: query },
        },
      },
      {
        $match: {
          location: {
            $geoWithin: {
              // Convert radius from meters to radians for $centerSphere
              $centerSphere: [[longitude, latitude], CACHE_RADIUS_METERS / 6378100],
            },
          },
        },
      },
      {
        $limit: 20,
      },
    ];

    const cachedProducts = await productsCollection.aggregate(pipeline).toArray();

    if (cachedProducts.length > 0) {
      console.log(`Cache hit: Found ${cachedProducts.length} products for query "${query}" in the database.`);
      return res.status(200).json(cachedProducts);
    }

    console.log(`Cache miss for query "${query}". Fetching from Geoapify.`);
    const geoapifyResults = await searchWithGeoapify(query, latitude, longitude);

    const validProducts = geoapifyResults
      .map(p => CanonicalProductSchema.partial().safeParse(p))
      .filter(p => p.success)
      .map(p => (p as { success: true; data: Partial<CanonicalProduct> }).data);

    if (validProducts.length > 0) {
      const operations = validProducts.map(product => ({
        updateOne: {
          filter: { canonicalProductId: product.canonicalProductId },
          update: { $set: product },
          upsert: true,
        },
      }));
      await productsCollection.bulkWrite(operations);
      console.log(`Persisted ${validProducts.length} products.`);
    }

    const productIds = validProducts.map(p => p.canonicalProductId).filter((id): id is string => !!id);

    const newProducts = await productsCollection.find({
      canonicalProductId: { $in: productIds }
    }).toArray();

    res.status(200).json(newProducts);

    newProducts.forEach(product => enrichProduct(product));

  } catch (error) {
    console.error("Error in /api/v1/search handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
});

export default router;