import type { Config } from 'tailwindcss';
import { content, plugin } from 'flowbite-react/tailwind';

export default {
	content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}', content()],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif']
			}
		}
	},
	plugins: [plugin()]
} satisfies Config;
