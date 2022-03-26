export interface ServerAnnouncementsState {
    entries: ServerAnnouncementsStateEntry[]
    feeds: string[]
}

export interface ServerAnnouncementsStateEntry {
    entry_id: string
    url: string
    title: string
    description: string
    priority: 'normal' | 'critical'
    date: Date
    dismissed: boolean
    source: string
    feed: string
}
