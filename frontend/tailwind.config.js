/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#FBFBFA',
          subtle: '#F4F4F2',
          card: '#FFFFFF',
          border: '#E4E4E0',
          borderSubtle: '#EEEEEC'
        },
        slate: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC'
        },
        semantic: {
          success: '#059669',
          successBg: '#ECFDF5',
          successBorder: '#A7F3D0',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          warningBorder: '#FDE68A',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
          dangerBorder: '#FECACA'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        'fine': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'institutional': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
