import type { AnnouncementEntry } from '@/types/moonraker/AnnouncementsRPC'

export interface ServerAnnouncementsState {
    entries: ServerAnnouncementsStateEntry[]
    feeds: string[]
}

export interface ServerAnnouncementsStateEntry extends Omit<
    AnnouncementEntry,
    'date' | 'date_dismissed' | 'dismiss_wake'
> {
    date: Date
    date_dismissed: Date | null
    dismiss_wake: Date | null
}
