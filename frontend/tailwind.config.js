/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        // Warm Earth & Journal Theme Colors
        parchment: '#FAF6EE',
        'journal-dark': '#2D312E',
        terracotta: {
          DEFAULT: '#C85C38',
          hover: '#A94A29',
          light: '#FBE8E1',
        },
        sage: {
          DEFAULT: '#4A6B53',
          hover: '#3A5441',
          light: '#EAF0EC',
        },
        ochre: {
          DEFAULT: '#D99C3B',
          light: '#FDF5E6',
        },
        sand: '#FFFDF9',
        
        // Mapped brand and surface classes for auto-theming compatibility
        brand: {
          50: '#FDF5F2',
          100: '#FBE8E1',
          200: '#F7D0C3',
          300: '#F0A892',
          400: '#E47F61',
          500: '#C85C38', // Mapped to Terracotta
          600: '#A94A29',
          700: '#8E3B1E',
          800: '#733019',
          900: '#5E2815',
          950: '#3D170B',
        },
        surface: {
          DEFAULT: '#FAF6EE', // Mapped to Parchment
          50: '#FFFDF9',      // Mapped to Sand card
          100: '#F3EDE2',
          200: '#EAE1D3',
          300: '#DECFC0',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #C85C38 0%, #D99C3B 100%)',
        'gradient-dark': 'linear-gradient(135deg, #FAF6EE 0%, #FFFDF9 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(200,92,56,0.06) 0%, rgba(217,156,59,0.03) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'spin-compass': 'spinCompass 12s linear infinite',
        'sway-backpack': 'swayBackpack 2.5s ease-in-out infinite',
        'wobble-plane': 'wobblePlane 3s ease-in-out infinite',
        'pulse-pin': 'pulsePin 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(15px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        spinCompass: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        swayBackpack: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        wobblePlane: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-2px) translateX(2px) rotate(1deg)' },
          '75%': { transform: 'translateY(2px) translateX(-2px) rotate(-1deg)' },
        },
        pulsePin: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'journal-sm': '0 2px 8px rgba(45,49,46,0.04)',
        'journal': '0 6px 20px rgba(45,49,46,0.06), 0 2px 6px rgba(45,49,46,0.03)',
        'journal-hover': '0 12px 30px rgba(45,49,46,0.12), 0 4px 10px rgba(45,49,46,0.04)',
        'stamp': '0 0 0 4px #FAF6EE, 0 0 0 6px #C85C38',
      },
    },
  },
  plugins: [],
};
