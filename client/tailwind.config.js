/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bespoke color palette matching user reference
        brand: {
          50: '#FAF9EE',   // Swatch 1: Luxury Ivory Cream
          100: '#F2F6B1',  // Swatch 2: Soft Pale Lime Tint
          200: '#E4EE7E',
          300: '#D8E85C',
          400: '#CDDE42',  // Swatch 3: Electric Lime / Chartreuse Accent
          500: '#CDDE42',  
          600: '#758045',  // Swatch 4: Muted Olive Sage
          700: '#4D5627',
          800: '#2E3514',
          900: '#1C220E',  // Swatch 5: Deep Dark Forest Olive / Dark Noir
          950: '#14180A',
        },
        noir: {
          DEFAULT: '#14180A',
          800: '#1C220E',
          900: '#14180A',
          950: '#0E1206',
        },
        cream: {
          DEFAULT: '#FAF9EE',
          50: '#FCFBF6',
          100: '#FAF9EE',
          200: '#F4F2DE',
          300: '#EAE6CB',
        },
        lime: {
          accent: '#CDDE42',
          tint: '#F2F6B1',
        },
        olive: {
          muted: '#9EA96F',
          dark: '#1C220E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -4px rgba(205, 222, 66, 0.35)',
        'glow-lime': '0 0 25px -4px rgba(205, 222, 66, 0.35)',
        'luxury': '0 20px 45px -15px rgba(28, 34, 14, 0.08)',
      }
    },
  },
  plugins: [],
}
