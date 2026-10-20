module.exports = {
  content: ['*.html/','./src/js/*.js',
    './docs/*.html'],
  darkMode: 'class', // or 'media' or false
  theme: {
    extend: {
      colors: {
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
      }
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
    },
  },
  variants: {
    extend: {
       backgroundOpacity: ['dark']
    }
  },
  plugins: [],
}