import type GCodeViewer from '@sindarius/gcodeviewer'

export type GCodeViewerInstance = InstanceType<typeof GCodeViewer>

export interface GcodeviewerState {
    viewerBackup: GCodeViewerInstance | null
    canvasBackup: HTMLCanvasElement | null
    loadedFileBackup: string | null
}
