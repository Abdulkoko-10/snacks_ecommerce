import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add swcMinify for potentially faster builds, optional but good practice
  swcMinify: true, 
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'], // This line is key
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '', // Keep empty for default https port
        pathname: '/images/**', // Allows all paths under /images/ on that hostname
      },
    ],
  },
  transpilePackages: ['react-icons'],
};

export default withBundleAnalyzer(nextConfig);
