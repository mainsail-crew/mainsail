export interface GuiMacrosState {
    mode: 'simple' | 'expert'
    hiddenMacros: string[]
    macrogroups: {
        [key: string]: GuiMacrosStateMacrogroup
    }
}

export interface GuiMacrosStateMacrogroup {
    id: string | null
    name: string
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'custom'
    colorCustom?: string
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
    macros?: GuiMacrosStateMacrogroupMacro[]
}

export interface GuiMacrosStateMacrogroupMacro {
    pos: number
    name: string
    color: 'group' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    showInStandby: boolean
    showInPrinting: boolean
    showInPause: boolean
}
