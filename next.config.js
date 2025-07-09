/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: resolve(__dirname, 'node_modules/buffer'),
        process: resolve(__dirname, 'node_modules/process/browser'),
        util: resolve(__dirname, 'node_modules/util'),
        crypto: resolve(__dirname, 'node_modules/crypto-browserify'),
        stream: resolve(__dirname, 'node_modules/stream-browserify'),
        fs: false,
        net: false,
        tls: false,
      };
      
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};

export default config;
