export interface GuiConsoleState {
    cleared_since?: number
    hideWaitTemperatures: boolean
    hideTlCommands: boolean
    direction: 'table' | 'shell'
    entryStyle: 'default' | 'compact'
    height: number
    autoscroll: boolean
    consolefilters: {
        [key: string]: GuiConsoleStateFilter
    }
}

export interface GuiConsoleStateFilter {
    id?: string | null
    bool: boolean
    name: string
    regex: string
}
