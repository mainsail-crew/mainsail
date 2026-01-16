declare module 'postcss-nesting' {
    import type { PluginCreator } from 'postcss'
    const postcssNesting: PluginCreator<{
        edition?: '2021' | '2024-02'
        noIsPseudoSelector?: boolean
        silenceAtNestWarning?: boolean
    }>
    export default postcssNesting
}
