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

export interface GuiStateMacrogroup {
    id: string | null
    name: string
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom'
    colorCustom?: string
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
    macros?: GuiStateMacrogroupMacros[]
}

export interface GuiStateMacrogroupMacros {
    pos: number
    name: string
    color: 'group' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
}