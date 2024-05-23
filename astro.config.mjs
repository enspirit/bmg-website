import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Bmg - Relational Algebra for Ruby',
			social: {
				github: 'https://github.com/enspirit/bmg',
			},
			sidebar: [
				{
					label: 'Relational Algebra Primer',
					autogenerate: { directory: 'ra-primer' },
				},
				{
					label: 'Usage',
					autogenerate: { directory: 'usage' },
				},
				{
					label: 'Recipies',
					autogenerate: { directory: 'recipies' },
				},
				{
					label: 'Operations reference',
					autogenerate: { directory: 'reference' },
				},
			],
			expressiveCode: {
				themes: ['dracula']
			}
		}),
	],
});
