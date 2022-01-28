import {createVuePlugin as vue} from 'vite-plugin-vue2'
import {VitePWA} from 'vite-plugin-pwa'
import {defineConfig} from 'vite'

import viteComponents, {VuetifyResolver,} from 'vite-plugin-components'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), VitePWA(),
        viteComponents({
            customComponentResolvers: [
                VuetifyResolver(),
            ],
        }),
		],
    envPrefix: "VUE_",
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // css: {
    // 	preprocessorOptions: {
    // 		sass: {
    // 			additionalData: [
    // 				// vuetify variable overrides
    // 				'@import "@/assets/styles/variables"',
    // 				'',
    // 			].join('\n'),
    // 		},
    // 	},
    // }
})