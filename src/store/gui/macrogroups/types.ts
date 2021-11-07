export interface GuiMacrogroupsState {
    macrogroups: {
        [key: string]: GuiMacrogroupsStateMacrogroup
    }
}

export interface GuiMacrogroupsStateMacrogroup {
    id: string | null
    name: string
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom'
    colorCustom?: string
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
    macros?: GuiMacrogroupsStateMacrogroupMacro[]
}

export interface GuiMacrogroupsStateMacrogroupMacro {
    pos: number
    name: string
    color: 'group' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
}