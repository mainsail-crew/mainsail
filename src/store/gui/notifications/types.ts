export interface GuiNotificationState {
    dismiss: GuiNotificationStateDismissEntry[]
}

export interface GuiNotificationStateEntry {
    id: string
    priority: 'normal' | 'high' | 'critical'
    title: string
    description: string
    date: Date
    dismissed: boolean
    url?: string
}

export interface GuiNotificationStateDismissEntry {
    id: string
    category: string
    type: string
    date: number
}
