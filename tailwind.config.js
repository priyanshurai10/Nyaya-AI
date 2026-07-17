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
        // ── Design System Tokens (mapped to CSS vars) ──────────────
        background: 'var(--background)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        'card-elevated': 'var(--card-elevated)',
        'card-hover': 'var(--card-hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-focus': 'var(--border-focus)',

        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          subtle: 'var(--primary-subtle)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          hover: 'var(--danger-hover)',
          subtle: 'var(--danger-subtle)',
        },

        // ── Text Scale ───────────────────────────────────────────────
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-disabled': 'var(--text-disabled)',

        // ── Legacy brand namespace ─────────────────────────────────
        brand: {
          background: 'var(--background)',
          card: 'var(--card)',
          'card-elevated': 'var(--card-elevated)',
          border: 'var(--border)',
          primary: 'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          accent: 'var(--accent)',
          success: 'var(--success)',
          danger: 'var(--danger)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
        },

        // ── Static Colors (India theme) ──────────────────────────
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
        ashoka: {
          DEFAULT: '#000080',
          light: '#1A1AFF',
        },
      },

      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:  ['0.75rem',   { lineHeight: '1rem' }],
        sm:  ['0.8125rem', { lineHeight: '1.25rem' }],
        base:['0.875rem',  { lineHeight: '1.5rem' }],
        md:  ['1rem',      { lineHeight: '1.5rem' }],
        lg:  ['1.125rem',  { lineHeight: '1.75rem' }],
        xl:  ['1.25rem',   { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':['3rem',     { lineHeight: '1.15' }],
      },

      borderRadius: {
        'sm': '0.375rem',
        'md': '0.625rem',
        'lg': '0.875rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      boxShadow: {
        'xs':  'var(--shadow-xs)',
        'sm':  'var(--shadow-sm)',
        'md':  'var(--shadow-md)',
        'lg':  'var(--shadow-lg)',
        'xl':  'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'primary': 'var(--shadow-primary)',
        // Legacy
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-tricolor': 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
        'gradient-primary': 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--accent) 0%, #FF6B35 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
        // Legacy
        'slide-in-right': 'slideInRight 0.2s ease-out',
      },

      keyframes: {
        fadeIn:      { from: { opacity: '0' },                                   to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(12px)' },    to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:   { from: { opacity: '0', transform: 'translateY(-8px)' },    to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.95) translateY(-4px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        slideInRight:{ from: { opacity: '0', transform: 'translateX(20px)' },    to: { opacity: '1', transform: 'translateX(0)' } },
        float:       { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        'glow-pulse':{ '0%, 100%': { boxShadow: '0 0 10px var(--primary-glow)' }, '50%': { boxShadow: '0 0 25px var(--primary-glow)' } },
        typing:      { '0%, 100%': { opacity: '0.3', transform: 'translateY(0)' }, '50%': { opacity: '1', transform: 'translateY(-3px)' } },
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
