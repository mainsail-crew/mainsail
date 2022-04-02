export interface GuiNotificationState {}

export interface GuiNotificationStateEntry {
    id: string
    priority: 'normal' | 'high' | 'critical'
    title: string
    description: string
    date: Date
    dismissed: boolean
    url?: string
}
