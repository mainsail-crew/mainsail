declare module 'echarts-gl/charts' {
    import type { EChartsExtensionInstaller } from 'echarts'
    export const Bar3DChart: EChartsExtensionInstaller
    export const Line3DChart: EChartsExtensionInstaller
    export const Scatter3DChart: EChartsExtensionInstaller
    export const Lines3DChart: EChartsExtensionInstaller
    export const Polygons3DChart: EChartsExtensionInstaller
    export const SurfaceChart: EChartsExtensionInstaller
    export const Map3DChart: EChartsExtensionInstaller
    export const ScatterGLChart: EChartsExtensionInstaller
    export const GraphGLChart: EChartsExtensionInstaller
    export const FlowGLChart: EChartsExtensionInstaller
    export const LinesGLChart: EChartsExtensionInstaller
}

declare module 'echarts-gl/components' {
    import type { EChartsExtensionInstaller } from 'echarts'
    export const Grid3DComponent: EChartsExtensionInstaller
    export const Geo3DComponent: EChartsExtensionInstaller
    export const GlobeComponent: EChartsExtensionInstaller
    export const Mapbox3DComponent: EChartsExtensionInstaller
    export const Maptalks3DComponent: EChartsExtensionInstaller
}
