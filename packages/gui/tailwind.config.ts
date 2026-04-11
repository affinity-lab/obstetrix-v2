import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: [require('@atom-forge/ui/tailwind')],
} satisfies Config;
