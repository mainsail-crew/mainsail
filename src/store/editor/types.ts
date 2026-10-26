export interface EditorState {
    bool: boolean
    filename: string
    fileroot: string
    permissions: string
    filepath: string
    sourcecode: string
    loader: {
        isLoading: boolean
        direction: 'downloading' | 'uploading'
        filename: string
        loaded: number
        total: number
        speed: string
    }
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
