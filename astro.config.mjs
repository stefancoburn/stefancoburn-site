import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stefancoburn.com',
  integrations: [sitemap()],

  build: {
    // The whole stylesheet is small once fonts are hand-declared, so embed it
    // in every page: one fewer render-blocking request on first visit.
    inlineStylesheets: 'always',
  },

  // Prefetch every internal link on hover (desktop) / touchstart (mobile, see
  // BaseLayout). With clientPrerender, Chromium browsers go further and fully
  // pre-render the next page in a hidden tab, so navigation is ~instant.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  experimental: {
    clientPrerender: true,
  },
});
