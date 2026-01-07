import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  site: "https://www.relational-algebra.dev",
  integrations: [vue(), starlight({
    credits: true,
    components: {
      SocialIcons: './src/components/overrides/SocialIcons.astro',
    },
    head: [
      // Analytics
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
      // Open Graph image
      {
        tag: 'meta',
        attrs: {
          property: 'og:image',
          content: 'https://www.relational-algebra.dev/og-image.png',
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:image:width',
          content: '1200',
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:image:height',
          content: '630',
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:image:alt',
          content: 'Relational Algebra for Modern Times - Bmg documentation',
        },
      },
      // Twitter Card metadata
      {
        tag: 'meta',
        attrs: {
          name: 'twitter:image',
          content: 'https://www.relational-algebra.dev/og-image.png',
        },
      },
      // JSON-LD Structured Data
      {
        tag: 'script',
        attrs: {
          type: 'application/ld+json',
        },
        content: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://www.relational-algebra.dev/#organization',
              'name': 'Bmg - Relational Algebra',
              'url': 'https://www.relational-algebra.dev',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://www.relational-algebra.dev/og-image.png',
              },
              'sameAs': [
                'https://github.com/enspirit/bmg',
                'https://github.com/enspirit/bmg.js',
                'https://github.com/enspirit/bmg-website'
              ]
            },
            {
              '@type': 'WebSite',
              '@id': 'https://www.relational-algebra.dev/#website',
              'url': 'https://www.relational-algebra.dev',
              'name': 'Relational Algebra for Modern Times',
              'description': 'Documentation for Bmg, a relational algebra library for Ruby and TypeScript',
              'publisher': {
                '@id': 'https://www.relational-algebra.dev/#organization'
              }
            }
          ]
        }),
      },
    ],
    title: 'Relational Algebra for Modern Times',
    favicon: '/favicon.ico',
    customCss: [
      './src/styles/custom.css',
    ],
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/enspirit/bmg-website' }
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
