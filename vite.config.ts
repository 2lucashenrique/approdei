import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Rodei - Gerenciador para Motoristas',
        short_name: 'Rodei',
        description: 'App para motoristas de aplicativo gerenciarem corridas, abastecimentos e lucros',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'lovable-uploads/a518e9b3-d296-42cf-9a5d-f09f94308d16.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'lovable-uploads/a518e9b3-d296-42cf-9a5d-f09f94308d16.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'lovable-uploads/a518e9b3-d296-42cf-9a5d-f09f94308d16.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              expiration: {
                maxEntries: 50,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false // Never register in dev or Lovable preview
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
