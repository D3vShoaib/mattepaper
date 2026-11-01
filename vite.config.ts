import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Mattepaper",
        short_name: "Mattepaper",
        description: "Your local EPUB library",
        theme_color: "#16161a",
        background_color: "#16161a",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: { globPatterns: ["**/*.{js,css,html,woff2,png,svg}"] },
    }),
  ],
  server: { hmr: false },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "zustand",
      "zustand/middleware",
    ],
    exclude: ["@pdfjs/pdf.min.mjs"],
  },
  build: { rolldownOptions: { external: ["@pdfjs/pdf.min.mjs"] } },
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "./src") },
    dedupe: ["react", "react-dom"],
  },
})
