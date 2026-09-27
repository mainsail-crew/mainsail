import { describe, expect, it } from 'vitest'
import { getters } from '@/store/gui/notifications/getters'
import type { RootState } from '@/store/types'

type GetterFn = (state: unknown, getters: unknown, rootState: unknown, rootGetters: unknown) => unknown

const bootedAt = new Date(2026, 8, 27, 8, 0, 0)

const evaluate = (hasUpdates: boolean, dismissedIds: string[] = []) => {
    const rootState = { server: { system_boot_at: bootedAt } } as unknown as RootState
    const rootGetters = {
        'server/firmware/hasUpdates': hasUpdates,
        'server/firmware/getUpdatableMcus': ['can', 'toolhead'],
        'server/firmware/getHost': { klippy_state: 'ready', klippy_message: '', software_version: 'v0.13.0-770' },
        'gui/notifications/getDismissByCategory': (category: string) =>
            category === 'firmware' ? dismissedIds.map((id) => ({ id, category, type: 'ever', date: 0 })) : [],
    }

    return (getters.getNotificationsFirmwareUpdates as GetterFn)({ dismiss: [] }, {}, rootState, rootGetters)
}

describe('getNotificationsFirmwareUpdates', () => {
    it('yields nothing without updates', () => {
        expect(evaluate(false)).toEqual([])
    })

    it('yields one entry keyed by the host version', () => {
        expect(evaluate(true)).toEqual([
            {
                id: 'firmware/v0.13.0-770',
                priority: 'normal',
                title: 'App.Notifications.FirmwareUpdates',
                description: 'App.Notifications.FirmwareUpdatesText',
                date: bootedAt,
                dismissed: false,
            },
        ])
    })

    it('hides the entry once dismissed for this host version only', () => {
        expect(evaluate(true, ['v0.13.0-770'])).toEqual([])
        expect(evaluate(true, ['v0.13.0-753'])).toHaveLength(1)
    })
})
