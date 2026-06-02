// @ts-check
import { defineConfig } from 'astro/config';

import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

const useCloudflareAdapter = process.env.NODE_ENV === 'production';

// https://astro.build/config
export default defineConfig({
  ...(useCloudflareAdapter
    ? {
        adapter: cloudflare({
          inspectorPort: false,
        }),
      }
    : {}),
  integrations: [
    react(),
    markdoc(),
    ...(
      process.env.SKIP_KEYSTATIC === 'true' || process.env.NODE_ENV === 'production'
        ? []
        : [keystatic()]
    ),
  ],
  vite: {
    cacheDir:
      process.env.NODE_ENV === 'production'
        ? '/tmp/class-edthings-vite-build-cache'
        : '/tmp/class-edthings-vite-dev-cache',
  },
});
