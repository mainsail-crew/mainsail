import vue from '@vitejs/plugin-vue2'
import version from 'vite-plugin-package-version'
import { defineConfig } from 'vite'

import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import { checker } from 'vite-plugin-checker'

import path from 'path'
import buildVersion from './src/plugins/build-version'
import buildReleaseInfo from './src/plugins/build-release_info'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import postcssNesting from 'postcss-nesting'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

const PWAConfig: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
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
    workbox: {
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg}'],
        navigateFallbackDenylist: [/^\/(access|api|printer|server|websocket)/, /^\/webcam[2-4]?/],
        runtimeCaching: [
            {
                urlPattern: (options) => options.url.pathname.startsWith('/config.json'),
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'config.json',
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
        VueI18nPlugin({
            strictMessage: false, // allow HTML tags in translation
            escapeHtml: false, // allow HTML tags in translation
        }),
    ],

    css: {
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
        alias: {
            '@': path.resolve(__dirname, './src'),
            stream: 'stream-browserify',
            events: 'events',
        },
    },

    optimizeDeps: {
        include: ['events'],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },

    server: {
        host: '0.0.0.0',
        port: 8080,
        proxy: {
            '/printer': 'http://192.168.1.34:7125',
            '/machine': 'http://192.168.1.34:7125',
            '/server': 'http://192.168.1.34:7125',
            '/access': 'http://192.168.1.34:7125',
            '/history': 'http://192.168.1.34:7125'
        }
    },
})
