import path from 'path';

export default {
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        linetool: path.resolve(__dirname, 'pages/line.html'),
        brushtool: path.resolve(__dirname, 'pages/brush.html'),
        polygontool: path.resolve(__dirname, 'pages/polygon.html'),
        processed: path.resolve(__dirname, 'pages/processed.html'),
        whatsnew: path.resolve(__dirname, 'pages/whatsnew.html')
      }
    }
  },
  worker: {
    // Configure worker options
    format: 'es', // Output format for worker bundle (ES module)
    // Additional worker options can be specified here, if needed
    // For example:
    // plugins: [], // Vite plugins that apply to the worker bundles
    // rollupOptions: {}, // Rollup options to build worker bundle
  },
};
