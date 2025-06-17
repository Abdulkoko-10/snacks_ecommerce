import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = sanityClient({
    projectId: 'ise1lfsl',
    dataset: 'production',
    apiVersion: '2022-03-10',
    useCdn: true,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);