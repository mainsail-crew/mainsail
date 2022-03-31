export interface NotificationState {}

export interface NotificationStateEntry {
    id: string
    priority: 'normal' | 'high' | 'critical'
    title: string
    description: string
    date: Date
    dismissed: boolean
    url?: string
}
