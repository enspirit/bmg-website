import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.relational-algebra.dev",
  integrations: [starlight({
    credits: true,
    head: [
      {
        tag: 'script',
        attrs: {
          src: 'https://scripts.simpleanalyticscdn.com/latest.js',
          defer: true,
          async: true,
        },
      },
      {
        tag: 'noscript',
        content: '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />',
      },
    ],
    title: 'Bmg documentation',
    favicon: '/favicon.ico',
    customCss: [
      './src/styles/custom.css',
    ],
    social: {
      github: 'https://github.com/enspirit/bmg'
    },
    sidebar: [{
      label: 'Relational Algebra Primer',
      autogenerate: {
        directory: 'ra-primer'
      }
    }, {
      label: 'Usage',
      autogenerate: {
        directory: 'usage'
      }
    }, {
      label: 'Operations reference',
      autogenerate: {
        directory: 'reference'
      }
    }],
    expressiveCode: {
      themes: ['dracula']
    }
  }), tailwind(), sitemap()]
});
