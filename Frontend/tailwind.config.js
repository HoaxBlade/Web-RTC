/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-1': 'var(--color-accent-1)',
        'accent-2': 'var(--color-accent-2)',
        'accent-3': 'var(--color-accent-3)',
        'accent-4': 'var(--color-accent-4)',
        'accent-5': 'var(--color-accent-5)',
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        'danger': 'var(--color-danger)',
      },
      boxShadow: {
        'custom': 'var(--drop-shadow-custom)',
        'inner-custom': 'var(--inner-shadow-custom)',
      },
      borderRadius: {
        'seven': 'var(--radius-seven)',
        'ten': 'var(--radius-ten)',
      },
      fontFamily: {
        'inter': 'var(--font-inter)',
      },
    },
  },
  plugins: [],
} 