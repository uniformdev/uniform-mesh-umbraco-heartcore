/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    UNIFORM_CANVAS_API_HOST: process.env.UNIFORM_CLI_BASE_URL || 'https://uniform.app',
    UNIFORM_API_KEY: process.env.UNIFORM_API_KEY,
    UNIFORM_PROJECT_ID: process.env.UNIFORM_PROJECT_ID,
    UMBRACO_HEARTCORE_PROJECT_ALIAS: process.env.UMBRACO_HEARTCORE_PROJECT_ALIAS,
    UMBRACO_HEARTCORE_API_KEY: process.env.UMBRACO_HEARTCORE_API_KEY,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
