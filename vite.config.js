import path from 'path'

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
    }
}