export interface GuiMiscellaneousState {
    entries: {
        [key: string]: GuiMiscellaneousStateEntry
    }
}

export interface GuiMiscellaneousStateEntry {
    id?: string
    type: string
    name: string
    lightgroups: {
        [key: string]: GuiMiscellaneousStateEntryLightgroup
    }
}

export interface GuiMiscellaneousStateEntryLightgroup {
    id?: string
    name: string
    start: number
    end: number
}
