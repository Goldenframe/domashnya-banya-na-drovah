import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://89.111.153.179:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        },
        historyApiFallback: true,
    },
})
