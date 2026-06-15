export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bloom: {
          pink:   '#F9A8C9',
          rose:   '#E91E8C',
          soft:   '#FFF0F7',
          green:  '#6DBE8C',
          mint:   '#E8F8EF',
          purple: '#C084FC',
          cream:  '#FFF8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
