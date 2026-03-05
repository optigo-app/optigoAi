/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'nzen',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nzen',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
