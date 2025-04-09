import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://api.dom-ban-na-drovah.ru', 
                changeOrigin: true,
                secure: false, 
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        },
        historyApiFallback: true,
    },
})