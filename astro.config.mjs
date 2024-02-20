import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'BMG - Relational Algebra for Ruby',
			social: {
				github: 'https://github.com/enspirit/bmg',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Relational Algebra Primer', link: '/guides/primer/' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
