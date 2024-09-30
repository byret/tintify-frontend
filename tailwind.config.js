module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // Указываем все пути к твоим компонентам
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f3e9e7',
        secondary: '#4a3a56',
        secondaryDarker: '#332b3a',
        pixelBg: '#f3e9e7',
        areasBg: '#fefefc',
        secondaryAreasBg: '#f6e8e7',
        activeBg: '#f47f88',
        inactiveBg: '#e5d1d2',
        blocked: '#bfbfbe'
      },
      fontFamily: {
        sans: ['nokiafc22', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}