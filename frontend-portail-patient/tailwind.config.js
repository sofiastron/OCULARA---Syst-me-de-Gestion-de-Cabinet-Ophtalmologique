/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        abyss: '#092C56',
        lapis: '#225688',
        'brand-slate': '#668CA9',
        glacier: '#A9CBE0',
        quartz: '#F0F5F4',
        // Keeping azure mapping to lapis/glacier just in case any leftover classes exist,
        // but the plan is to replace them all.
        azure: {
          50: '#F0F5F4',   // quartz
          100: '#eef6fc',
          200: '#A9CBE0',  // glacier
          300: '#8abce3',
          400: '#668CA9',  // slate custom
          500: '#3c79a8',
          600: '#225688',  // lapis
          700: '#1b456e',
          800: '#153554',
          900: '#092C56',  // abyss
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(9, 44, 86, 0.05)',
        'card': '0 8px 32px rgba(9, 44, 86, 0.08)',
        'glow': '0 0 40px rgba(34, 86, 136, 0.15)',
      }
    },
  },
  plugins: [],
}
