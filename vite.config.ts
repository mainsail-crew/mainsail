import vue from '@pedrolamas/plugin-vue2'
import version from 'vite-plugin-package-version'
import { defineConfig } from 'vitest/config'

import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import { checker } from 'vite-plugin-checker'

import path from 'path'
import buildVersion from './src/plugins/build-version'
import buildReleaseInfo from './src/plugins/build-release_info'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import postcssNesting from 'postcss-nesting'

const PWAConfig: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    includeAssets: ['fonts/**/*.woff2', 'img/**/*.svg', 'img/**/*.png'],
    manifest: {
        name: 'Mainsail',
        short_name: 'Mainsail',
        description: 'Web interface for Klipper 3D printer firmware',
        theme_color: '#D51F26',
        display: 'standalone',
        start_url: '/',
        background_color: '#121212',
        icons: [
            {
                src: '/img/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/img/icons/icon-192-maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/img/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/img/icons/icon-512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    },
    workbox: {
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg}'],
        navigateFallbackDenylist: [/^\/(access|api|printer|server|websocket)/, /^\/webcam[2-4]?/],
        runtimeCaching: [
            {
                urlPattern: /\/config\.json$/,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'config.json',
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    },
    /* enable sw on development */
    devOptions: {
        enabled: true,
        type: 'module',
        suppressWarnings: true,
    },
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        VitePWA(PWAConfig),
        buildVersion(),
        buildReleaseInfo(),
        vue(),
        version(),
        checker({
            typescript: {
                root: path.resolve(__dirname),
                buildMode: false,
            },
        }),
        Components({
            dts: true, // enabled by default if `typescript` is installed
            resolvers: [VuetifyResolver()],
        }),
    ],

    css: {
        preprocessorOptions: {
            sass: {
                silenceDeprecations: ['import', 'global-builtin', 'slash-div', 'if-function'],
                quietDeps: true,
            },
            scss: {
                silenceDeprecations: ['import', 'global-builtin', 'slash-div', 'if-function'],
                quietDeps: true,
            },
        },
        postcss: {
            plugins: [postcssNesting()],
        },
    },

    build: {
        target: 'safari12',
        rollupOptions: {
            output: {
                manualChunks: (id: string) => {
                    if (id.includes('node_modules')) {
                        // keep Vue in a single chunk
                        if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/')) {
                            return 'vue'
                        }

                        // split codemirror into its own chunk
                        if (id.includes('/codemirror/') || id.includes('/@codemirror/')) {
                            return 'codemirror'
                        }

                        // split these libs into their own chunks
                        const chunkedLibs = ['vuetify', 'echarts', 'overlayscrollbars']
                        for (const lib of chunkedLibs) {
                            if (id.includes(`/node_modules/${lib}/`)) {
                                return lib.replace('.js', '')
                            }
                        }
                    }
                },
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },

    envPrefix: 'VUE_',
    resolve: {
        dedupe: ['vue'],
        alias: {
            // Ensure every importer exact same Vue build
            vue: 'vue/dist/vue.runtime.esm.js',
            'vue/dist/vue.runtime.common.js': 'vue/dist/vue.runtime.esm.js',
            'vue/dist/vue.runtime.common.dev.js': 'vue/dist/vue.runtime.esm.js',
            'vue/dist/vue.runtime.common.prod.js': 'vue/dist/vue.runtime.esm.js',
            'vue/dist/vue.common.js': 'vue/dist/vue.runtime.esm.js',
            '@': path.resolve(__dirname, './src'),
            stream: 'stream-browserify',
            events: 'events',
        },
    },

    // 'global' is required by node polyfills (stream-browserify, events) at runtime
    define: {
        global: 'globalThis',
    },

    // Vite 8 transforms TS via Oxc, which (unlike the build) does not auto-detect
    // experimentalDecorators from tsconfig in per-file transforms (e.g. Vitest).
    // Vue 2 class components rely on legacy decorators, so enable them explicitly.
    oxc: {
        decorator: {
            legacy: true,
        },
    },

    optimizeDeps: {
        include: ['events'],
    },

    server: {
        host: '0.0.0.0',
        port: 8080,
    },

    test: {
        environment: 'node',
        include: ['tests/**/*.spec.ts'],
    },
})
