import {createVuePlugin as vue} from 'vite-plugin-vue2'
import {VitePWA} from 'vite-plugin-pwa'
import loadVersion from 'vite-plugin-package-version';
import {defineConfig} from 'vite'

import viteComponents, {VuetifyResolver,} from 'vite-plugin-components'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA(),
        loadVersion(),
        viteComponents({
            customComponentResolvers: [
                VuetifyResolver(),
            ],
        }),
    ],
    define: {
        '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
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