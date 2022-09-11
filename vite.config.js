import { sveltekit } from '@sveltejs/kit/vite'
import { setDefaultResultOrder } from 'dns'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		fs: {
			strict: false
		},
		port: 3000
	},
	preview: {
		port: 4000
	},
	ssr: {
		external: ['firebase']
	}
}

setDefaultResultOrder('verbatim')

export default config
