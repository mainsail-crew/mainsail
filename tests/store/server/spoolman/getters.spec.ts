import { describe, expect, it } from 'vitest'
import { getters } from '@/store/server/spoolman/getters'
import { getDefaultState } from '@/store/server/spoolman/index'
import type { ServerSpoolmanState, ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

const makeSpool = (id: number, material = 'PLA'): ServerSpoolmanStateSpool => ({
    id,
    registered: '2026-01-01',
    archived: false,
    filament: {
        id: 1,
        registered: '2026-01-01',
        name: `${material} Spool ${id}`,
        color_hex: 'FF0000',
        density: 1.24,
        diameter: 1.75,
        material,
        price: 20,
        settings_bed_temp: 60,
        settings_extruder_temp: 210,
        spool_weight: 200,
        weight: 1000,
        vendor: { id: 1, registered: '2026-01-01', name: 'TestVendor' },
    },
    first_used: '2026-01-01',
    last_used: '2026-01-01',
    remaining_length: 300,
    remaining_weight: 800,
    used_length: 100,
    used_weight: 200,
})

// Helper to call a getter function with state.
const callGetter = (name: string, state: ServerSpoolmanState) => {
    const getter = getters[name]
    if (typeof getter === 'function') {
        return (getter as Function)(state, {}, {}, {})
    }
    return undefined
}

describe('spoolman getters', () => {
    describe('getToolSpool', () => {
        it('returns spool detail for a tool that has one', () => {
            const state = getDefaultState()
            const spool = makeSpool(5)
            state.tool_spool_details = { 0: spool }
            const fn = callGetter('getToolSpool', state)
            expect(fn(0)).toEqual(spool)
        })

        it('returns null for a tool with no spool detail', () => {
            const state = getDefaultState()
            const fn = callGetter('getToolSpool', state)
            expect(fn(0)).toBeNull()
        })

        it('returns correct spool for each tool in multi-tool setup', () => {
            const state = getDefaultState()
            const spool0 = makeSpool(10, 'PLA')
            const spool1 = makeSpool(20, 'PETG')
            state.tool_spool_details = { 0: spool0, 1: spool1 }
            const fn = callGetter('getToolSpool', state)
            expect(fn(0)?.id).toBe(10)
            expect(fn(1)?.id).toBe(20)
        })

        it('returns null for unassigned tool in multi-tool setup', () => {
            const state = getDefaultState()
            state.tool_spool_details = { 0: makeSpool(10), 1: null }
            const fn = callGetter('getToolSpool', state)
            expect(fn(0)?.id).toBe(10)
            expect(fn(1)).toBeNull()
        })

        it('returns null for out-of-range tool index', () => {
            const state = getDefaultState()
            state.tool_spool_details = { 0: makeSpool(10) }
            const fn = callGetter('getToolSpool', state)
            expect(fn(5)).toBeNull()
        })
    })

    describe('hasToolSpools', () => {
        it('returns false when tool_spools is empty (single-tool or no spoolman)', () => {
            const state = getDefaultState()
            const result = callGetter('hasToolSpools', state)
            expect(result).toBe(false)
        })

        it('returns true when tool_spools has entries', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 100 }
            const result = callGetter('hasToolSpools', state)
            expect(result).toBe(true)
        })

        it('returns true when multi-tool map has entries (even null values)', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 100, 1: null }
            const result = callGetter('hasToolSpools', state)
            expect(result).toBe(true)
        })
    })
})
