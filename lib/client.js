import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ise1lfsl';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2022-03-10';
const readToken = process.env.NEXT_PUBLIC_SANITY_TOKEN;

// Client for read-only operations (public facing)
export const readClient = sanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // `true` for faster read operations
  token: readToken,
  ignoreBrowserTokenWarning: true,
});

// Client for fetching fresh data, bypassing the CDN
export const previewClient = sanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // `false` to always fetch fresh data
  token: readToken,
  ignoreBrowserTokenWarning: true,
});

// Client for write operations (server-side only, using a token)
// Ensure SANITY_API_WRITE_TOKEN is set in your .env.local or server environment
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

export const writeClient = writeToken ? sanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // `false` for write operations and fresh data
  token: writeToken,
}) : null; // Or throw an error if token is essential for app to run

// Image URL builder (can use readClient)
const builder = imageUrlBuilder(readClient);
export const urlFor = (source) => builder.image(source);

// For the API route, we will import `writeClient` and check if it's null.
// If `writeClient` is null in the API route, it means the token is not configured,
// and the API should return an error.