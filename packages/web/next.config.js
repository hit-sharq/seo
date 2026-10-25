/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@seo-command-center/shared', '@seo-command-center/database', '@seo-command-center/api'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;