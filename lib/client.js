import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = sanityClient({
    projectId: 'ise1lfsl',
    dataset: 'production',
    apiVersion: '2022-03-10',
    useCdn: true,
    // token: process.env.NEXT_PUBLIC_SANITY_TOKEN // This line is removed or commented out
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);