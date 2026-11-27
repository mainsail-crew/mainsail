import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import { announcements, getDefaultState } from '@/store/server/announcements'
import type { ServerAnnouncementsState } from '@/store/server/announcements/types'
import type { AnnouncementEntry } from '@/types/moonraker/AnnouncementsRPC'

Vue.use(Vuex)

type Responder = (params: Record<string, unknown>) => unknown

const rawEntry = (entry_id: string, overrides: Partial<AnnouncementEntry> = {}): AnnouncementEntry => ({
    entry_id,
    url: `https://github.com/${entry_id}`,
    title: `Title ${entry_id}`,
    description: 'Description',
    priority: 'normal',
    date: 1000,
    dismissed: false,
    date_dismissed: null,
    dismiss_wake: null,
    source: 'moonlight',
    feed: 'moonraker',
    ...overrides,
})

let responders: Record<string, Responder>
const emitAndWait = vi.fn(async (method: string, params: Record<string, unknown> = {}) => {
    const responder = responders[method]
    if (!responder) throw { code: -32601, message: `Method not found: ${method}` }

    return responder(params)
})
const windowStub = { console: { error: vi.fn(), debug: vi.fn() } }

const createStore = () =>
    new Store({
        modules: {
            announcements: { ...announcements, state: getDefaultState() },
        },
    })

const announcementsState = (store: Store<unknown>) =>
    (store.state as { announcements: ServerAnnouncementsState }).announcements

describe('server/announcements/actions', () => {
    beforeEach(() => {
        emitAndWait.mockClear()
        windowStub.console.error.mockClear()
        Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
        vi.stubGlobal('window', windowStub)

        responders = {
            'server.announcements.list': () => ({
                entries: [rawEntry('a'), rawEntry('b', { dismissed: true, date_dismissed: 2000, dismiss_wake: 3000 })],
                feeds: ['moonraker', 'klipper'],
            }),
            'server.announcements.dismiss': (params) => ({ entry_id: params.entry_id }),
        }
    })

    it('loads entries and feeds on init and converts timestamps to dates', async () => {
        const store = createStore()

        await store.dispatch('announcements/init')

        const state = announcementsState(store)
        expect(state.feeds).toEqual(['moonraker', 'klipper'])
        expect(state.entries.map((entry) => entry.entry_id)).toEqual(['a', 'b'])
        expect(state.entries[0].date).toEqual(new Date(1000 * 1000))
        expect(state.entries[0].date_dismissed).toBeNull()
        expect(state.entries[0].dismiss_wake).toBeNull()
        expect(state.entries[1].date_dismissed).toEqual(new Date(2000 * 1000))
        expect(state.entries[1].dismiss_wake).toEqual(new Date(3000 * 1000))
    })

    it('does not throw when init fails', async () => {
        responders = {}
        const store = createStore()

        await expect(store.dispatch('announcements/init')).resolves.toBeUndefined()
        expect(announcementsState(store).entries).toEqual([])
        expect(windowStub.console.error).toHaveBeenCalled()
    })

    it('replaces entries on notify_announcement_update and keeps the feeds', async () => {
        const store = createStore()
        await store.dispatch('announcements/init')

        await store.dispatch('announcements/notifyAnnouncementUpdate', { entries: [rawEntry('c')] })

        const state = announcementsState(store)
        expect(state.entries.map((entry) => entry.entry_id)).toEqual(['c'])
        expect(state.feeds).toEqual(['moonraker', 'klipper'])
    })

    it('marks an entry as dismissed on notify_announcement_dismissed', async () => {
        const store = createStore()
        await store.dispatch('announcements/init')

        await store.dispatch('announcements/notifyAnnouncementDismissed', { entry_id: 'a' })

        const entry = announcementsState(store).entries[0]
        expect(entry.dismissed).toBe(true)
        expect(entry.date_dismissed).toBeInstanceOf(Date)
    })

    it('resets the dismissed state on notify_announcement_wake', async () => {
        const store = createStore()
        await store.dispatch('announcements/init')

        await store.dispatch('announcements/notifyAnnouncementWake', { entry_id: 'b' })

        const entry = announcementsState(store).entries[1]
        expect(entry.dismissed).toBe(false)
        expect(entry.date_dismissed).toBeNull()
        expect(entry.dismiss_wake).toBeNull()
    })

    it('dismisses an announcement indefinitely without a wake time', async () => {
        const store = createStore()

        await store.dispatch('announcements/dismiss', { entry_id: 'a' })

        expect(emitAndWait).toHaveBeenCalledWith('server.announcements.dismiss', { entry_id: 'a', wake_time: null })
    })

    it('dismisses an announcement with a wake time', async () => {
        const store = createStore()

        await store.dispatch('announcements/dismiss', { entry_id: 'a', wake_time: 3600 })

        expect(emitAndWait).toHaveBeenCalledWith('server.announcements.dismiss', { entry_id: 'a', wake_time: 3600 })
    })

    it('propagates dismiss errors to the caller', async () => {
        responders['server.announcements.dismiss'] = () => {
            throw { code: 400, message: 'No key matching entry id: x' }
        }
        const store = createStore()

        await expect(store.dispatch('announcements/dismiss', { entry_id: 'x' })).rejects.toMatchObject({ code: 400 })
    })
})
