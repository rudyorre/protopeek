import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Material Design 3 Typography Scale
        'display-large': ['3.5rem', { lineHeight: '1.12', letterSpacing: '-0.025em', fontWeight: '400' }],
        'display-medium': ['2.875rem', { lineHeight: '1.16', letterSpacing: '0', fontWeight: '400' }],
        'display-small': ['2.25rem', { lineHeight: '1.22', letterSpacing: '0', fontWeight: '400' }],
        'headline-large': ['2rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '500' }],
        'headline-medium': ['1.75rem', { lineHeight: '1.29', letterSpacing: '0', fontWeight: '500' }],
        'headline-small': ['1.5rem', { lineHeight: '1.33', letterSpacing: '0', fontWeight: '500' }],
        'title-large': ['1.375rem', { lineHeight: '1.27', letterSpacing: '0', fontWeight: '500' }],
        'title-medium': ['1rem', { lineHeight: '1.5', letterSpacing: '0.009375em', fontWeight: '500' }],
        'body-large': ['1rem', { lineHeight: '1.5', letterSpacing: '0.03125em', fontWeight: '400' }],
        'body-medium': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.015625em', fontWeight: '400' }],
        'label-large': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.00625em', fontWeight: '500' }],
        'label-medium': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.03125em', fontWeight: '500' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
