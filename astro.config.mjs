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
      autogenerate: {
        directory: 'usage'
      }
    }, {
      label: 'Operators reference',
      autogenerate: {
        directory: 'reference'
      }
    }],
    expressiveCode: {
      themes: ['dracula']
    }
  }), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
