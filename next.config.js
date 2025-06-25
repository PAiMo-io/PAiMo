import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["r2.paimo.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s.sctvideo.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve("./utils/templates/email"),
              to: path.resolve('public/email-templates'),
            },
            // {
            //   from: path.resolve("./app/i18n"),
            //   to: path.resolve('public/i18n'),
            // },
          ],
        })
      );
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/email-templates/:path*',
        destination: '/',
        permanent: false, 
      },
    ];
  },
};

export default nextConfig;
