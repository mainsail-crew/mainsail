export interface EditorState {
    bool: boolean
    filename: string
    fileroot: string
    permissions: string
    filepath: string
    sourcecode: string
    loaders: Record<EditorRequestType, EditorLoader>
    loadedHash: string
    changed: boolean
}

export interface EditorOpenFilePayload {
    root: string
    path: string
    filename: string
    size: number
    permissions: string
}

export type EditorRequestType = 'download' | 'upload'

export interface EditorLoader {
    isLoading: boolean
    filename: string
    loaded: number
    total: number
    speed: string
}

export type EditorLoaderProgress = Pick<EditorLoader, 'loaded' | 'total' | 'speed'>
