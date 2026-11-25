import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'electron/main.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173
  }
});
