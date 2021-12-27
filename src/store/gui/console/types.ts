export interface GuiConsoleState {
    hideWaitTemperatures: boolean
    hideTlCommands: boolean
    direction: 'table' | 'shell'
    entryStyle: 'default' | 'compact'
    height: number
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