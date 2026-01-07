import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from "@tailwindcss/vite";
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
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/enspirit/bmg' }
    ],
    sidebar: [{
      label: 'Relational Algebra Primer',
      autogenerate: {
        directory: 'ra-primer'
      }
    }, {
      label: 'Bmg compared to',
      autogenerate: {
        directory: 'comparison'
      }
    }, {
      label: 'Usage',
      items: [
        { slug: 'usage/getting-started' },
        { slug: 'usage/getting-started-ts' },
        { slug: 'usage/with-rdbms' }
      ]
    }, {
      label: 'Reference',
      items: [
        { label: 'Overview', slug: 'reference/overview' },
        {
          label: 'Relational Operators',
          collapsed: true,
          autogenerate: { directory: 'reference/relational' }
        },
        {
          label: 'Non-Relational Operators',
          collapsed: true,
          autogenerate: { directory: 'reference/non-relational' }
        },
        { label: 'Library Alignment', slug: 'reference/library-alignment' }
      ]
    }],
    expressiveCode: {
      themes: ['dracula']
    }
  }), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
