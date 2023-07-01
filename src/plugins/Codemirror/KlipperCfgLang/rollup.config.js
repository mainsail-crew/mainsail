import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
    input: 'src/plugins/Codemirror/KlipperCfgLang/parser/klipperCfgParser.js',
    output: [
        {
            format: 'cjs',
            file: 'src/plugins/Codemirror/KlipperCfgLang/dist/klipperCfgParser.cjs',
        },
        {
            format: 'es',
            file: 'src/plugins/Codemirror/KlipperCfgLang/dist/klipperCfgParser.es.js',
        },
    ],
    external(id) {
        return !/^[\.\/]/.test(id)
    },
    plugins: [nodeResolve()],
}
