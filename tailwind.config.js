/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // near-black with a blue cast, so it sits under the logo instead of fighting it
        ink: {
          950: '#04060c',
          900: '#070b14',
          850: '#0b111e',
          800: '#101828',
          700: '#182236',
          600: '#243247'
        },
        brand: {
          50: '#e6f6ff',
          100: '#ccedff',
          200: '#99dbff',
          300: '#66c9ff',
          400: '#33b7ff',
          500: '#00a3ff',
          600: '#0082cc',
          700: '#006199',
          800: '#004166',
          900: '#002033',
          DEFAULT: '#00a3ff'
        },
        aqua: { DEFAULT: '#22d3ee', 400: '#22d3ee', 500: '#06b6d4' }
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-devanagari)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif']
      },

      // small sizes that repeat everywhere, named instead of written as text-[10px]
      fontSize: {
        '3xs': ['9px', '12px'],
        '2xs': ['10px', '14px'],
        tiny: ['11px', '16px'],
        'tiny+': ['13px', '19px']
      },

      zIndex: { nav: '30', bar: '40', toast: '60' },

      boxShadow: {
        glow: '0 0 40px -8px rgba(0,163,255,0.55)',
        glowLg: '0 0 90px -14px rgba(0,163,255,0.6)',
        card: '0 18px 40px -18px rgba(0,0,0,0.9)',
        poster: '0 30px 70px -18px rgba(0,0,0,0.95)',
        lift: '0 26px 60px -22px rgba(0,163,255,0.45)',
        topbar: '0 10px 30px -18px rgba(0,163,255,0.5)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.06)'
      },

      backgroundImage: {
        'brand-grad': 'linear-gradient(120deg, var(--accent), var(--accent-2))',
        'grid-lines':
          'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        stripes: 'repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 9px)',
        'dot-grid': 'radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px)'
      },
      backgroundSize: { grid: '56px 56px', dots: '15px 15px' },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(.22,.68,.28,1)',
        spring: 'cubic-bezier(.2,.8,.3,1)'
      },

      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pageIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(.995)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(.8)' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        drift: {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(3%,-4%,0) scale(1.08)' },
          '100%': { transform: 'translate3d(-3%,3%,0) scale(.96)' }
        },
        glowPulse: { '0%,100%': { opacity: '.45' }, '50%': { opacity: '.9' } },
        kenburns: {
          '0%': { transform: 'scale(1.02) translateY(0)' },
          '100%': { transform: 'scale(1.14) translateY(-2%)' }
        },
        sweep: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' }
        },
        barGrow: { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } }
      },

      animation: {
        fadeUp: 'fadeUp .45s cubic-bezier(.22,.68,.28,1) both',
        fadeIn: 'fadeIn .45s ease both',
        pageIn: 'pageIn .4s cubic-bezier(.22,.68,.28,1) both',
        scaleIn: 'scaleIn .32s cubic-bezier(.2,.8,.3,1) both',
        popIn: 'popIn .34s cubic-bezier(.2,.8,.3,1) both',
        marquee: 'marquee 46s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        drift: 'drift 22s ease-in-out infinite alternate',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
        kenburns: 'kenburns 16s ease-out both',
        sweep: 'sweep 1.1s ease-out',
        barGrow: 'barGrow .7s cubic-bezier(.22,.68,.28,1) both'
      }
    }
  },
  plugins: []
}
