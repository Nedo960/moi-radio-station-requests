/**
 * Application Configuration
 *
 * This file centralizes all environment-dependent configuration.
 *
 * For Netlify deployment:
 * - Set REACT_APP_API_URL in Netlify dashboard -> Site settings -> Environment variables
 * - Example: https://radio-station-backend.onrender.com/api
 *
 * For local development:
 * - Create a .env file in the frontend directory with:
 *   REACT_APP_API_URL=http://localhost:5000/api
 */

const config = {
  // API Base URL - defaults to localhost for development
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',

  // Other configuration options can be added here
  APP_NAME: 'Radio Station Request System',
  VERSION: '1.0.0',

  // JWT token storage key
  TOKEN_KEY: 'radio_station_token',

  // Environment check
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 App Configuration:', {
    API_URL: config.API_URL,
    Environment: process.env.NODE_ENV
  });
}

export default config;
