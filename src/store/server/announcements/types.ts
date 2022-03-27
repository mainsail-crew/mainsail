export interface ServerAnnouncementsState {
    entries: ServerAnnouncementsStateEntry[]
    feeds: string[]
}

export interface ServerAnnouncementsStateEntry {
    entry_id: string
    url: string
    title: string
    description: string
    priority: 'normal' | 'high'
    date: Date
    dismissed: boolean
    date_dismissed: Date | null
    dismiss_wake: Date | null
    source: string
    feed: string
}
