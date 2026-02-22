import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Reddit brand color - adjusted for better contrast
        reddit: '#E03E00',
        redditDark: '#CC3700',
        redditLight: '#FF6B4A',
      },
    },
  },
  plugins: [],
}
export default config
