import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Dev API URL points at the local Express server (default :3001).
// In production, set PUBLIC_API_URL to the deployed API origin.
const API_URL = process.env.PUBLIC_API_URL ?? "http://localhost:3001";

export default defineConfig({
  output: "static",
  site: "https://learn-acoustic-guitar.local",
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.PUBLIC_API_URL": JSON.stringify(API_URL),
    },
    server: {
      // Proxy /api/* to the Express backend in dev so the app can use relative
      // URLs and avoid CORS friction.
      proxy: {
        "/api": API_URL,
        "/health": API_URL,
      },
    },
  },
  integrations: [react()],
});
