/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add swcMinify for potentially faster builds, optional but good practice
  swcMinify: true, 
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'], // This line is key
};

export default nextConfig;
