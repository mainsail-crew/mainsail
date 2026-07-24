import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { resolve } from 'path';
export default defineConfig({
    plugins: [vue()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    },
    build: {
        // Output directly to public/plugins then you can use <hostname>/plugins/plugin.mjs as remote url
        outDir: resolve(__dirname, '../../public/plugins'),
        emptyOutDir: false,
        lib: {
            entry: 'src/main.ts',
            name: 'ExamplePanelPlugin',
            formats: ['es'],
            fileName: () => `example-panel-plugin.mjs`
        },
        rolldownOptions: {
            external: ['vue', 'vue-property-decorator', 'vue-class-component'],
            output: {
                globals: {
                    vue: 'Vue',
                    process: 'process'
                }
            }
        }
    },
    preview: {
        port: 8081,
        cors: { origin: 'http://localhost:8080' }
    }
});
