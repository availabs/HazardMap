// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Proxima Nova W01', ...defaultTheme.fontFamily.sans],
        serif: [...defaultTheme.fontFamily.serif],
        mono: [...defaultTheme.fontFamily.mono]
      }
    }
  },
  variants: {
    borderRadius: ['responsive', 'first', 'last'],
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
