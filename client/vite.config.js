import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://api.dom-ban-na-drovah.ru', 
                changeOrigin: true,       
                secure: true,            
                rewrite: (path) => path.replace(/^\/api/, ''), 
                headers: {
                    'X-Forwarded-Proto': 'https'
                }
            }
        },
        historyApiFallback: true,
    },
})