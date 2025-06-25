/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['r2.paimo.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.sctvideo.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;