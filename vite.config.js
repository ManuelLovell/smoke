import path from 'path';

export default {
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        linetool: path.resolve(__dirname, 'pages/line.html'),
        brushtool: path.resolve(__dirname, 'pages/brush.html'),
        elevationtool: path.resolve(__dirname, 'pages/elevation.html'),
        polygontool: path.resolve(__dirname, 'pages/polygon.html'),
      }
    }
  },
};
