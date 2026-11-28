import { describe, expect, it } from 'vitest'
import { mutations } from '@/store/server/announcements/mutations'
import { getters } from '@/store/server/announcements/getters'
import { getDefaultState } from '@/store/server/announcements'
import type { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import type { RootState } from '@/store/types'

const entry = (
    entry_id: string,
    overrides: Partial<ServerAnnouncementsStateEntry> = {}
): ServerAnnouncementsStateEntry => ({
    entry_id,
    url: '',
    title: entry_id,
    description: '',
    priority: 'normal',
    date: new Date(0),
    dismissed: false,
    date_dismissed: null,
    dismiss_wake: null,
    source: 'moonlight',
    feed: 'moonraker',
    ...overrides,
})

const createState = (): ServerAnnouncementsState => {
    const state = getDefaultState()
    mutations.setEntries(state, [
        entry('a'),
        entry('b', { dismissed: true, date_dismissed: new Date(1000), dismiss_wake: new Date(2000) }),
    ])

    return state
}

describe('server/announcements/mutations', () => {
    it('dismisses an entry and keeps the wake date', () => {
        const state = createState()
        state.entries[0].dismiss_wake = new Date(5000)

        mutations.setDismissed(state, { entry_id: 'a', dismissed: true })

        expect(state.entries[0].dismissed).toBe(true)
        expect(state.entries[0].date_dismissed).toBeInstanceOf(Date)
        expect(state.entries[0].dismiss_wake).toEqual(new Date(5000))
    })

    it('wakes an entry and clears the dismiss dates', () => {
        const state = createState()

        mutations.setDismissed(state, { entry_id: 'b', dismissed: false })

        expect(state.entries[1]).toMatchObject({ dismissed: false, date_dismissed: null, dismiss_wake: null })
    })

    it('ignores unknown entries', () => {
        const state = createState()
        const before = [...state.entries]

        mutations.setDismissed(state, { entry_id: 'unknown', dismissed: true })

        expect(state.entries).toEqual(before)
    })

    it('resets to the default state', () => {
        const state = createState()
        mutations.setFeeds(state, ['moonraker'])

        mutations.reset(state, undefined)

        expect(state).toEqual(getDefaultState())
    })
})

describe('server/announcements/getters', () => {
    it('returns only active announcements', () => {
        const state = createState()

        const result = getters.activeAnnouncements(state, {}, {} as RootState, {})

        expect(result.map((item: ServerAnnouncementsStateEntry) => item.entry_id)).toEqual(['a'])
    })
})
