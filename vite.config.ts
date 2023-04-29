import { createVuePlugin as vue } from 'vite-plugin-vue2'
import loadVersion from 'vite-plugin-package-version'
import { defineConfig, loadEnv } from 'vite'

import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import checker from 'vite-plugin-checker'

import path from 'path'
import buildVersion from './src/plugins/build-version'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'

const PWAConfig: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    includeAssets: ['fonts/**/*.woff2', 'img/**/*.svg', 'img/**/*.png'],
    manifest: {
        name: 'Mainsail',
        short_name: 'Mainsail',
        theme_color: '#D51F26',
        background_color: '#121212',
        icons: [
            {
                src: '/img/icons/icon-192-maskable.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/img/icons/icon-512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/img/icons/icon-512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
    },
    /* enable sw on development */
    devOptions: {
        enabled: true,
    },
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd())
    return {
        base: env.VITE_BASE,
        plugins: [
            VitePWA(PWAConfig),
            buildVersion(),
            vue(),
            loadVersion(),
            checker({ typescript: true }),
            Components({
                dts: true, // enabled by default if `typescript` is installed
                resolvers: [VuetifyResolver()],
            }),
        ],
        css: {
            preprocessorOptions: {
                css: { charset: false },
                scss: {
                    quietDeps: true,
                },
            },
        },

        build: {
            target: 'safari12',
        },

        envPrefix: 'VUE_',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },

        server: {
            host: '0.0.0.0',
            port: 8080,
        },
    }
});
