/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F5F0E6',
          card: '#FCF9F2',
          subtle: '#EFE8DA',
          border: '#D8CFC0',
          ink: '#F2EDE4',
        },
        ink: {
          DEFAULT: '#1F1D1A',
          muted: '#5E584F',
          canvas: '#161412',
          card: '#201D19',
          elevated: '#292520',
          border: '#3C362E',
        },
        sage: {
          DEFAULT: '#B8E0A0',
          strong: '#2E7D32',
          dark: '#233522',
          text: '#1D4D21',
        },
        sand: {
          DEFAULT: '#F4DFB0',
          strong: '#B45309',
          dark: '#382C1B',
        },
        lavender: {
          DEFAULT: '#E4DCF8',
          strong: '#5B3CC4',
          dark: '#2B243B',
        },
        coral: {
          DEFAULT: '#FAD4CF',
          strong: '#C83E37',
          dark: '#3B2220',
        },
        periwinkle: {
          DEFAULT: '#D1E2FA',
          strong: '#2458A6',
          dark: '#1D2C3F',
        },
      },
      boxShadow: {
        tactile: '0 2px 0 0 #1F1D1A',
        'tactile-sm': '0 1.5px 0 0 #1F1D1A',
        'tactile-dark': '0 2px 0 0 #0B0A08',
      },
    },
  },
  plugins: [],
}
