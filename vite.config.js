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
        elevationwarning: path.resolve(__dirname, 'pages/ewarning.html'),
        polygontool: path.resolve(__dirname, 'pages/polygon.html'),
        contextembed: path.resolve(__dirname, 'pages/contextembed.html'),
        wallcontextembed: path.resolve(__dirname, 'pages/wallcontextembed.html'),
        mapcontextembed: path.resolve(__dirname, 'pages/mapcontextembed.html'),
        notice: path.resolve(__dirname, "src/notice/notice.html"),
      }
    }
  },
};
