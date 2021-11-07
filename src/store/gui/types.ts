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

export interface GuiStateConsoleFilter {
    bool: boolean
    index?: string
    name: string
    regex: string
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