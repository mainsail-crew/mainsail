import {createVuePlugin as vue} from 'vite-plugin-vue2'
import loadVersion from 'vite-plugin-package-version'
import {defineConfig} from 'vite'
import Components from 'unplugin-vue-components/vite'
import {VuetifyResolver,} from 'unplugin-vue-components/resolvers'

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
    ], css: {
        preprocessorOptions: {
            css: {charset: false},
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
