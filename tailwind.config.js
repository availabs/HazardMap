// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      }
    }
  },
  variants: {
    borderRadius: ['responsive', 'first', 'last'],
    borderColor: ['responsive', 'hover', 'focus', 'disabled'],
    margin: ['responsive', 'first', 'last'],
    padding: ['responsive', 'first', 'last'],
    backgroundColor: ['responsive', 'hover', 'focus', 'first', 'last', 'odd', 'even', 'disabled'],
    cursor: ['disabled', 'responsive'],
    opacity: ['responsive', 'disabled', 'hover', 'focus'],
    textColor: ['responsive', 'hover', 'focus', 'disabled'],
    fontWeight: ['responsive', 'hover', 'focus', 'disabled']
  },
  plugins: [
    require('@tailwindcss/ui'),
  ]
}
