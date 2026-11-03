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
      registerType: "prompt",
      manifest: {
        id: "/",
        name: "Mattepaper",
        short_name: "Mattepaper",
        description: "Read EPUB books offline. Your books stay on this device.",
        lang: "en",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "portrait",
        theme_color: "#121212",
        background_color: "#121212",
        categories: ["books", "education", "entertainment"],
        prefer_related_applications: false,
        launch_handler: { client_mode: "navigate-existing" },
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/monochrome-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "monochrome",
          },
        ],
        shortcuts: [
          {
            name: "My library",
            short_name: "Library",
            description: "Browse your offline library",
            url: "/",
            icons: [
              {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "Settings",
            short_name: "Settings",
            description: "Adjust app and reading preferences",
            url: "/settings",
            icons: [
              {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,ttf,woff,woff2,webmanifest}",
        ],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
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
