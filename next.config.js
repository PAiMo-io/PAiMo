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
              to: path.resolve(".next/server/utils/templates/email"),
            },
            {
              from: path.resolve("./app/i18n"),
              to: path.resolve(".next/server/app/i18n"),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
