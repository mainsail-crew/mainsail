import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { getters } from '@/store/printer/getters'
import type { PrinterState } from '@/store/printer/types'
import type { RootState } from '@/store/types'

describe('printer/getEstimatedTimeETAFormat', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    const runGetter = (eta: number, hours12Format = false) => {
        const moduleGetters = {
            getEstimatedTimeETA: eta,
        } as Record<string, number>

        const rootGetters = {
            'gui/getHours12Format': hours12Format,
        } as Record<string, boolean>

        return getters.getEstimatedTimeETAFormat({} as PrinterState, moduleGetters, {} as RootState, rootGetters)
    }

    it('returns "--" when eta is not in the future', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0))

        const eta = new Date(2024, 0, 1, 10, 0, 0).getTime()
        expect(runGetter(eta)).toBe('--')

        const eta2 = new Date(2024, 0, 1, 9, 0, 0).getTime()
        expect(runGetter(eta2)).toBe('--')
    })

    it('formats time in 24-hour mode without day offset', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0))

        const eta = new Date(2024, 0, 1, 16, 5, 0).getTime()
        expect(runGetter(eta)).toBe('16:05')
    })

    it('formats time in 24-hour mode with day offset case 1', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 22, 0, 0))
        const eta = new Date(2024, 0, 2, 1, 0, 0).getTime()
        expect(runGetter(eta)).toBe('01:00 +1')
    })

    it('formats time in 24-hour mode with day offset case 2', () => {
        vi.setSystemTime(new Date(2023, 11, 31, 22, 0, 0))
        const eta = new Date(2024, 0, 1, 0, 0, 0).getTime()
        expect(runGetter(eta)).toBe('00:00 +1')
    })

    it('formats time in 24-hour mode with day offset case 3', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 22, 0, 0))
        const eta = new Date(2024, 0, 3, 1, 0, 0).getTime()
        expect(runGetter(eta)).toBe('01:00 +2')
    })

    it('formats time in 24-hour mode with day offset case 4', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 1, 0, 0))
        const eta = new Date(2025, 0, 1, 1, 0, 0).getTime()
        expect(runGetter(eta)).toBe('01:00 +366') // 2024 is a leap year thats why +366
    })

    it('formats time in 24-hour mode with day offset', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 22, 0, 0))
        const eta = new Date(2024, 0, 2, 1, 0, 0).getTime()
        expect(runGetter(eta)).toBe('01:00 +1')

        const eta2 = new Date(2024, 0, 2, 0, 0, 0).getTime()
        expect(runGetter(eta2)).toBe('00:00 +1')
    })

    it('formats time in 12-hour mode without day offset', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0))

        const eta = new Date(2024, 0, 1, 16, 5, 0).getTime()
        expect(runGetter(eta, true)).toBe('04:05 PM')
    })

    it('formats time in 12-hour mode with day offset', () => {
        vi.setSystemTime(new Date(2024, 0, 1, 23, 30, 0))

        const eta = new Date(2024, 0, 2, 1, 0, 0).getTime()
        expect(runGetter(eta, true)).toBe('01:00 AM +1')
    })
})
