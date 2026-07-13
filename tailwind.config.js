/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E8EDF5',
          100: '#C5D0E6',
          200: '#8FA1CC',
          300: '#5972B3',
          400: '#2D4A8C',
          500: '#142952',
          600: '#0F2040',
          700: '#0C1830',
          800: '#0A1628',
          900: '#060E1A',
          950: '#030810',
        },
        saffron: {
          50: '#FFF5E6',
          100: '#FFE8C2',
          200: '#FFD699',
          300: '#FFC266',
          400: '#FFAD33',
          500: '#FF9933',
          600: '#E68A2E',
          700: '#CC7A29',
          800: '#B36B24',
          900: '#804D1A',
        },
        emerald: {
          50: '#E6F5EC',
          100: '#B3E0C4',
          200: '#80CC9C',
          300: '#4DB874',
          400: '#26A85C',
          500: '#138808',
          600: '#107A07',
          700: '#0D6B06',
          800: '#0A5C05',
          900: '#073D03',
        },
        ashoka: {
          DEFAULT: '#000080',
          light: '#1A1AFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-tricolor': 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
        'gradient-saffron': 'linear-gradient(135deg, #FF9933 0%, #E68A2E 100%)',
        'gradient-navy': 'linear-gradient(135deg, #0A1628 0%, #142952 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'saffron': '0 4px 20px rgba(255, 153, 51, 0.3)',
        'emerald': '0 4px 20px rgba(19, 136, 8, 0.3)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'float': 'none',
        'pulse-slow': 'none',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'typing': 'typing 1.5s ease-in-out infinite',
        'glow': 'none',
        'shimmer': 'none',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        typing: {
          '0%': { opacity: '0.2' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 153, 51, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 153, 51, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
