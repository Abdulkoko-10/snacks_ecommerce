import { previewClient, urlFor } from '../client';
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Fetches AI-powered product recommendations based on a user's query.
 *
 * @param {string} userQuery The user's search query or message.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of recommended products.
 */
export async function getAiRecommendations(userQuery) {
  if (!userQuery) {
    console.warn("getAiRecommendations called with no query. Returning empty array.");
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("RECOMMENDATION_SERVICE_WARN: Missing Gemini API key. Returning mock data for local development.");
    return getMockRecommendations();
  }

  try {
    // 1. Fetch all products from Sanity to create a catalog for the AI.
    const productsQuery = `*[_type == "product"]{_id, name, details}`;
    const allProducts = await previewClient.fetch(productsQuery);

    if (!allProducts || allProducts.length === 0) {
      console.warn("RECOMMENDATION_SERVICE_WARN: No products found in Sanity. Cannot make recommendations.");
      return [];
    }

    // 2. Construct a detailed prompt for the Gemini AI.
    const productCatalogString = allProducts.map(p => `ID: "${p._id}", Name: "${p.name}", Details: "${p.details}"`).join('; ');

    const systemInstruction = `You are a food recommendation expert for a catalog of snacks. Your task is to analyze a user's request and recommend the most relevant products from the provided list.

    **Instructions:**
    1.  Analyze the user's query: "${userQuery}".
    2.  Review the following product catalog: [${productCatalogString}].
    3.  Identify the top 3 most relevant products.
    4.  For each recommendation, provide a brief, friendly "reason" explaining why it's a good match for the user's query.
    5.  You MUST respond with only a valid, minified JSON object in the following format:
        {
          "recommendations": [
            { "productId": "product_id_1", "reason": "Your brief reason here." },
            { "productId": "product_id_2", "reason": "Your brief reason here." },
            ...
          ]
        }
    6.  If no products are relevant, return an empty array: { "recommendations": [] }.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using a powerful model for this task
    });

    // 3. Call the Gemini API.
    const result = await model.generateContent(systemInstruction);
    const response = result.response;
    const responseText = response.text();

    // 4. Parse the structured JSON response, now with robust extraction.
    const jsonBlock = responseText.match(/```json\n([\s\S]*?)\n```/);
    let parsedResponse;
    if (jsonBlock && jsonBlock[1]) {
      parsedResponse = JSON.parse(jsonBlock[1]);
    } else {
      // Fallback for when the AI doesn't use markdown formatting
      const jsonStartIndex = responseText.indexOf('{');
      const jsonEndIndex = responseText.lastIndexOf('}');
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
        parsedResponse = JSON.parse(jsonString);
      } else {
        console.error("Could not find a valid JSON block in the AI response.");
        return [];
      }
    }

    const aiRecs = parsedResponse.recommendations || [];

    if (aiRecs.length === 0) {
      console.log("AI returned no recommendations.");
      return [];
    }

    // 5. Fetch full product details for the recommended IDs.
    const recommendedIds = aiRecs.map(rec => rec.productId);
    const recommendedProductsQuery = `*[_type == "product" && _id in $ids]{_id, name, image, price, details, slug}`;
    const sanityProducts = await previewClient.fetch(recommendedProductsQuery, { ids: recommendedIds });

    // 6. Format the final list of products with AI-generated reasons.
    const finalRecommendations = sanityProducts.map(product => {
      const aiReason = aiRecs.find(rec => rec.productId === product._id)?.reason || "You might enjoy this!";
      return {
        canonicalProductId: product._id,
        preview: {
          title: product.name,
          image: product.image ? urlFor(product.image[0]).width(400).url() : '/default-product-image.png',
          rating: 4.7, // Placeholder, as this isn't in the schema yet
          minPrice: product.price,
          bestProvider: "SnacksCo",
          eta: "10-20 min", // Placeholder
          originSummary: ["SnacksCo"],
          slug: product.slug?.current,
          details: product.details,
        },
        reason: aiReason,
        meta: {
          generatedBy: "gemini-ai",
          confidence: 0.95, // Placeholder
        }
      };
    });

    // The order from Sanity might not match the AI's recommendation order. Let's re-order it.
    const orderedRecommendations = recommendedIds
      .map(id => finalRecommendations.find(p => p.canonicalProductId === id))
      .filter(p => p); // Filter out any potential misses

    return orderedRecommendations;

  } catch (error) {
    console.error("Error in getAiRecommendations:", error);
    // Return empty array on failure to prevent crashes downstream.
    return [];
  }
}

/**
 * Returns a set of mock recommendations for local development.
 * @returns {Array<Object>} A list of mock recommended products.
 */
function getMockRecommendations() {
  return [
    {
      canonicalProductId: "mock-product-1",
      preview: {
        title: "Spicy Mock-a-roni",
        image: "/mock-images/spicy-mock-a-roni.png",
        rating: 4.8,
        minPrice: 5.99,
        bestProvider: "MockSnacks",
        eta: "5-10 min",
        originSummary: ["MockSnacks"],
        slug: "spicy-mock-a-roni",
        details: "A fiery twist on a classic favorite. Not for the faint of heart!",
      },
      reason: "This is a great choice if you're looking for something with a kick!",
      meta: {
        generatedBy: "mock-data-generator",
        confidence: 1.0,
      }
    },
    {
      canonicalProductId: "mock-product-2",
      preview: {
        title: "Sweet & Salty Mockcorn",
        image: "/mock-images/sweet-salty-mockcorn.png",
        rating: 4.6,
        minPrice: 4.99,
        bestProvider: "MockSnacks",
        eta: "5-10 min",
        originSummary: ["MockSnacks"],
        slug: "sweet-salty-mockcorn",
        details: "The perfect balance of sweet and savory. A crowd-pleaser!",
      },
      reason: "A classic choice that satisfies both sweet and salty cravings.",
      meta: {
        generatedBy: "mock-data-generator",
        confidence: 1.0,
      }
    }
  ];
}