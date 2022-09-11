const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

const config = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter var', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				base: colors.indigo
			},
			screens: {
				desktop: { raw: '(hover: hover)' }
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
}

module.exports = config
