import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    getCncState,
    getCncWcs,
    selectCncWcs,
    setCncCoolant,
    setCncSpindle,
    setCncUnits,
    setCncZero,
    updateCncSettings,
} from '@/store/files/cncApi'

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

function mockFetchResponse(payload: unknown, ok = true, status = 200) {
    return {
        ok,
        status,
        json: vi.fn(async () => payload),
    }
}

describe('cncApi helper', () => {
    it('posts spindle commands to the CNC API', async () => {
        const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => mockFetchResponse({ ok: true, type: 'spindle' }))
        vi.stubGlobal('fetch', fetchMock)

        await setCncSpindle('http://localhost:7125', { state: 'cw', rpm: 18000 })

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:7125/server/cnc/spindle',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: 'cw', rpm: 18000 }),
            })
        )
    })

    it('posts coolant, units, WCS, zero, jog and settings payloads', async () => {
        const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => mockFetchResponse({ ok: true }))
        vi.stubGlobal('fetch', fetchMock)

        await Promise.all([
            setCncCoolant('http://localhost:7125', { flood: true, mist: false }),
            setCncUnits('http://localhost:7125', 'G20'),
            selectCncWcs('http://localhost:7125', { wcs: 'G56', offsets: { X: 1, Y: 2, Z: 3 } }),
            setCncZero('http://localhost:7125', { axes: ['X', 'Z'] }),
            updateCncSettings('http://localhost:7125', { feedrateXY: 100, feedrateZ: 10 }),
        ])

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:7125/server/cnc/coolant',
            expect.objectContaining({ body: JSON.stringify({ flood: true, mist: false }) })
        )
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:7125/server/cnc/units',
            expect.objectContaining({ body: JSON.stringify({ units: 'G20' }) })
        )
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:7125/server/cnc/wcs/select',
            expect.objectContaining({ body: JSON.stringify({ wcs: 'G56', offsets: { X: 1, Y: 2, Z: 3 } }) })
        )
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:7125/server/cnc/wcs/set-zero',
            expect.objectContaining({ body: JSON.stringify({ axes: ['X', 'Z'] }) })
        )
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:7125/server/cnc/settings',
            expect.objectContaining({ body: JSON.stringify({ feedrateXY: 100, feedrateZ: 10 }) })
        )
    })

    it('reads CNC state endpoints', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(mockFetchResponse({ state: 'ok' }))
            .mockResolvedValueOnce(mockFetchResponse({ active: 'G54' }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(getCncState('http://localhost:7125')).resolves.toEqual({ state: 'ok' })
        await expect(getCncWcs('http://localhost:7125')).resolves.toEqual({ active: 'G54' })
    })
})
