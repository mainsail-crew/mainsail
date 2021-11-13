export interface GuiState {
    webcamSettings: {
        currentCam: {
            dashboard: string
            page: string
        }
        boolNavi: boolean
    }
    [key: string]: any
}