export interface EditorState {
    bool: boolean
    filename: string
    fileroot: string
    filepath: string
    sourcecode: string
    loaderBool: boolean
    loaderProgress: {
        direction: 'downloading' | 'uploading'
        lastTimestamp: number
        lastLoaded: number
        loaded: number
        total: number
        speed: string
    },
    cancelToken: any
}