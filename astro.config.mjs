// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import keystatic from '@keystatic/astro';

/**
 * Keystatic runs in `local` storage mode: it reads and writes files in this
 * repo, with no login. That is safe on a developer machine and unsafe on the
 * public internet, so the admin (/keystatic), its API (/api/keystatic), and
 * React (which exists only for the admin) are registered under `astro dev`
 * only. Production builds contain no admin and no React.
 *
 * TODO: when switching keystatic.config.tsx to `github` storage, replace
 * `devOnly(react())` / `devOnly(keystatic())` with `react()` / `keystatic()`
 * so the admin deploys (behind GitHub login) as an on-demand Netlify function.
 */
/** @param {import('astro').AstroIntegration} integration */
function devOnly(integration) {
  let enabled = false;
  /** @type {Record<string, any>} */
  const hooks = {};
  for (const [name, hook] of Object.entries(integration.hooks)) {
    /** @param {any} options */
    hooks[name] = (options) => {
      // astro:config:setup is always the first hook and the only one told the command.
      if (name === 'astro:config:setup') enabled = options.command === 'dev';
      return enabled ? /** @type {any} */ (hook)(options) : undefined;
    };
  }
  return { name: `${integration.name} (dev only)`, hooks };
}

export default defineConfig({
  // TODO: replace with the real production origin before launch.
  // Required by @astrojs/sitemap and for absolute canonical URLs.
  site: 'https://example.com',
  output: 'static',
  // URLs are trailing-slash (build.format 'directory'; Netlify redirects /x to /x/).
  // Not 'always': Keystatic's admin calls its API without trailing slashes.
  trailingSlash: 'ignore',
  // devFeatures off: the site uses no Netlify image CDN, env vars, or edge
  // functions, and the edge emulator needs Deno, which crashes `astro dev` without it.
  adapter: netlify({ devFeatures: false }),
  // No sessions: the site has no logged-in state. (The Netlify adapter would
  // otherwise enable them, backed by Netlify Blobs.)
  session: false,
  integrations: [
    // Never add a `client:*` directive to a public page or component.
    devOnly(react()),
    devOnly(keystatic()),
    sitemap({ filter: (page) => !page.includes('/contact/thanks/') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
