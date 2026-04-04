declare module '@sindarius/gcodeviewer' {
    interface ViewerBuildVolumeAxis {
        min: number
        max: number
    }

    interface ViewerBuildVolume {
        x: ViewerBuildVolumeAxis
        y: ViewerBuildVolumeAxis
        z: ViewerBuildVolumeAxis
    }

    interface ViewerBed {
        buildVolume: ViewerBuildVolume
        setBedColor(color: string): void
        setDelta(enabled: boolean): void
    }

    interface ViewerAxes {
        show(enabled: boolean): void
    }

    interface ViewerObjectMetadata {
        cancelled?: boolean
        name?: string
    }

    interface ViewerObjectBoundary {
        cancelled: boolean
        name: string
        x: number[]
        y: number[]
    }

    interface ViewerBuildObjects {
        objectCallback: ((metadata: ViewerObjectMetadata | null) => void) | null
        loadObjectBoundaries(objects: ViewerObjectBoundary[]): void
        showObjectSelection(enabled: boolean): void
    }

    interface ViewerToolPosition {
        axes: string
        position: number
    }

    interface ViewerGCodeProcessor {
        loadingProgressCallback: ((progress: number) => void) | null
        cancelLoad: boolean
        voxelWidth: number
        voxelHeight: number
        g1AsExtrusion: boolean
        colorMode: number

        useHighQualityExtrusion(enabled: boolean): void
        updateForceWireMode(enabled: boolean): void
        setAlpha(enabled: boolean): void
        setVoxelMode(enabled: boolean): void
        useSpecularColor(enabled: boolean): void
        setLiveTracking(enabled: boolean): void
        updateFilePosition(position: number): void
        resetTools(): void
        addTool(color: string, nozzleDiameter: number): void
        setColorMode(mode: number): void
        updateColorRate(min: number, max: number): void
        updateMinFeedColor(color: string): void
        updateMaxFeedColor(color: string): void
    }

    export default class GCodeViewer {
        constructor(canvas: HTMLCanvasElement)

        renderQuality: number
        fileSize: number
        fileData: string

        gcodeProcessor: ViewerGCodeProcessor
        bed: ViewerBed
        axes: ViewerAxes
        buildObjects: ViewerBuildObjects

        init(): Promise<void>
        resize(): void
        processFile(fileData: string): Promise<void>
        reload(): Promise<void>
        clearScene(fullReset: boolean): void
        resetCamera(): void
        forceRender(): void
        simulateToolPosition(): void
        updateToolPosition(position: ViewerToolPosition[]): void
        toggleTravels(enabled: boolean): void
        setBackgroundColor(color: string): void
        setCursorVisiblity(visible: boolean): void
        setZClipPlane(max: number, min: number): void
        updateRenderQuality(quality: number): void
        lastLoadFailed(): boolean
        clearLoadFlag(): void
        setProgressColor(color: string): void
    }
}
