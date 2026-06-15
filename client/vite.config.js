import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isRender = !!process.env.RENDER;

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    hmr: isRender
      ? { host: "coffeebeanfusion-com.onrender.com", protocol: "wss" }
      : true,
  },
});

