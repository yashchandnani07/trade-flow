
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // This allows requests from the development environment's domain.
  // Adding this configuration to fix WebSocket connection issues for HMR.
  experimental: {
    // This is the recommended way to configure HMR in environments like Google Cloud Workstations
    hmrServerOptions: {
      host: '0.0.0.0',
      port: 6000,
    },
    // This allows requests from the development environment's domain.
    allowedDevOrigins: ["*.cloudworkstations.dev", "*.firebase.studio"],
  },
};

module.exports = nextConfig;
