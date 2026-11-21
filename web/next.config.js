/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  // Allow loading .env from parent repo directory
  env: {
    NEXT_PUBLIC_APP_VERSION: '2.0.0'
  }
};

module.exports = nextConfig;
