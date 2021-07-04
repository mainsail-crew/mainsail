export interface EditorState {
    bool: boolean
    filename: string
    sourcecode: string
    loaderBool: boolean
    loaderProgress: {
        lastTimestamp: number
        lastLoaded: number
        loaded: number
        total: number
        speed: string
    },
    cancelToken: any
}