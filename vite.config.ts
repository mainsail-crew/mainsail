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

/**
 * Matches URL pathnames that belong to Mainsail's client-side router.
 * Used by both navigateFallbackAllowlist and the navigation runtime cache
 * so the service worker never intercepts paths owned by co-hosted apps
 * (e.g. /spoolman, /authelia).
 */
const MAINSAIL_ROUTES = /^\/(allPrinters|cam|console|heightmap|files|viewer|history|timelapse|config|settings)(\/.*)?$|^\/$/

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
        // Only handle Mainsail's own client-side routes; all other paths
        // (e.g. /spoolman, /authelia) must reach the real server.
        navigateFallbackAllowlist: [MAINSAIL_ROUTES],
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
            {
                // Avoid caching auth redirects on HTML navigation requests.
                urlPattern: new Function(
                    '{ request, url }',
                    `return request.mode === 'navigate' && ${MAINSAIL_ROUTES}.test(url.pathname)`
                ) as any,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'mainsail-navigation-cache',
                    cacheableResponse: {
                        statuses: [200],
                    },
                    plugins: [
                        {
                            cacheWillUpdate: async ({ response }) => {
                                if (response && response.redirected) {
                                    return null
                                }
                                return response
                            },
                        },
                    ],
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
    },

    test: {
        environment: 'node',
        include: ['tests/**/*.spec.ts'],
    },
})
