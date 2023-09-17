import path from 'path'

export default {
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                linetool: path.resolve(__dirname, 'pages/line.html'),
                polygontool: path.resolve(__dirname, 'pages/polygon.html'),
                whatsnew: path.resolve(__dirname, 'pages/whatsnew.html')
            }
        }
    }
}