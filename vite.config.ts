import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// LexBeacon AI | BlueHexion Technologies
// Same stack family as BMET SEEKER: Vite + React + TypeScript, deployed on Cloudflare.
// In development the AI routes (/api/*) are proxied to `wrangler dev` (npm run dev:worker, port 8787).
export default defineConfig({
  server: { host: "::", port: 8080, proxy: { "/api": "http://127.0.0.1:8787" } },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") }, dedupe: ["react", "react-dom"] },
});
