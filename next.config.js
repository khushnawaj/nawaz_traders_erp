/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
};

// Dev bundler route re-sync
module.exports = nextConfig;
