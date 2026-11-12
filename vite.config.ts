import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages needs its repository subpath; Android and local builds use relative assets.
  base: mode === 'github-pages' ? '/FNI-APP-2.0/' : './',
}));
