export interface GuiConsolefiltersState {
    consolefilters: {
        [key: string]: GuiConsolefiltersStateFilter
    }
}

export interface GuiConsolefiltersStateFilter {
    id?: string | null
    bool: boolean
    name: string
    regex: string
}