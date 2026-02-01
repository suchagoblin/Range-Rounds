import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // This tells the app to look for files in the current folder
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
