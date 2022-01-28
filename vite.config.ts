import {createVuePlugin as vue} from 'vite-plugin-vue2'
import {VitePWA} from 'vite-plugin-pwa'
import loadVersion from 'vite-plugin-package-version'
import {defineConfig} from 'vite'

import Components from 'unplugin-vue-components/vite'
import {
    VuetifyResolver,
} from 'unplugin-vue-components/resolvers'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        loadVersion(),
        Components({
            resolvers: [
                VuetifyResolver(),
            ],
        }),
        VitePWA({
            manifest: {
                'short_name': 'Mainsail',
                'name': 'Mainsail',
                'start_url': '/',
                'display': 'standalone',
                'theme_color': '#D51F26',
                'background_color': '#121212',
                'icons': [
                    {
                        'src': './img/icons/icon-196-maskable.png',
                        'sizes': '196x196',
                        'type': 'image/png',
                        'purpose': 'maskable',
                    },
                    {
                        'src': './img/icons/icon-512-maskable.png',
                        'sizes': '512x512',
                        'type': 'image/png',
                        'purpose': 'maskable',
                    },
                ]
            }
        }),
    ], css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true
            },
        }
    },
    envPrefix: 'VUE_',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    server: {
        port: 8080
    }
})