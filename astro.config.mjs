import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: 'Bmg - Relational Algebra for Ruby',
    favicon: '/favicon.ico',
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
      label: 'Recipies',
      autogenerate: {
        directory: 'recipies'
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
  }), tailwind()]
});
