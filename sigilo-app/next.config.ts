import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // ggwave uses fs module which is not available in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Ignore Solana kit - we only use Ethereum/Sepolia
      config.resolve.alias = {
        ...config.resolve.alias,
        "@solana/kit": false,
      };
    }

    // Reown/WalletConnect externals
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Ignore unused wagmi connector dependencies
    const webpack = require("webpack");

    // Ignore Solana kit (we only use Ethereum)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@solana\/kit/,
      })
    );

    // Ignore optional wagmi connectors we don't use
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@gemini-wallet\/core/,
      })
    );

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^porto$/,
      })
    );

    // Ignore porto/internal subpath
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^porto\/internal$/,
      })
    );

    // Ignore React Native async storage (not needed for web)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@react-native-async-storage\/async-storage/,
      })
    );

    return config;
  },
};

export default nextConfig;
