import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/lean-coffee/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
