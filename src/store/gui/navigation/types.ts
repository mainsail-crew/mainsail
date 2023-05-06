export interface GuiNavigationState {
    entries: GuiNavigationStateEntry[]
}

export interface GuiNavigationStateEntry {
    type: 'route' | 'link'
    title: string
    visible: boolean
    position: number
}
