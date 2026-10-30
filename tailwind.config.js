/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',        // Slate 900 elegante
          blue: '#059669',        // Esmeralda primario de Mauricio Marín
          lightBlue: '#10b981',   // Esmeralda brillante
          ice: '#ecfdf5',         // Fondo menta suave
          iceBorder: '#a7f3d0',   // Borde esmeralda delicado
          surface: '#f8fafc',     // Fondo neutro slate
          orange: '#FF5E0E',      // Naranja moderno y vibrante
          orangeHover: '#E65100', // Naranja oscuro hover
          slate: '#334155',       // Slate texto intermedio
          muted: '#64748b'        // Slate texto secundario
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'card': '0 10px 30px -4px rgba(15, 23, 42, 0.08)',
        'glow-orange': '0 4px 20px -2px rgba(255, 94, 14, 0.40)',
        'glow-blue': '0 4px 20px -2px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
