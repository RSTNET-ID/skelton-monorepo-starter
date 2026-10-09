import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	const isDevelopment = mode === 'development';

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				adapter: adapter({
					precompress: true
				}),
				csp: {
					mode: 'auto',
					directives: {
						'default-src': ['self'],
						'base-uri': ['self'],
						'connect-src': isDevelopment
							? ['self', 'https:', 'http:', 'ws:', 'wss:']
							: ['self', 'https:'],
						'font-src': ['self', 'data:'],
						'form-action': ['self'],
						'frame-ancestors': ['none'],
						'img-src': ['self', 'data:', 'blob:'],
						'object-src': ['none'],
						'script-src': ['self'],
						'style-src': ['self']
					}
				}
			})
		],
		server: {
			host: '0.0.0.0',
			port: 5173
		},
		preview: {
			host: '0.0.0.0',
			port: 4173
		}
	};
});
