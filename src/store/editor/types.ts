export interface EditorState {
    bool: boolean
    filename: string
    fileroot: string
    permissions: string
    filepath: string
    sourcecode: string
    loaderBool: boolean
    loaderProgress: {
        direction: 'downloading' | 'uploading'
        loaded: number
        total: number
        speed: string
    }
    cancelToken: any
    loadedHash: string
    changed: boolean
}
