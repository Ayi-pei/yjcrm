export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api',
    wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8787',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  };