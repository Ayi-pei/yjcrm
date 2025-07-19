import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // Environment variables
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@components': path.resolve(__dirname, './components'),
        '@services': path.resolve(__dirname, './services'),
        '@stores': path.resolve(__dirname, './stores'),
        '@types': path.resolve(__dirname, './types.ts'),
      }
    },
    
    // Development server
    server: {
      port: 5173,
      host: true,
      open: true,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@headlessui/react'],
            utils: ['zustand', 'immer'],
          }
        }
      }
    },
    
    // Preview server
    preview: {
      port: 4173,
      host: true,
    }
  };
});