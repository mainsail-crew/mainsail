import { describe, expect, it, vi } from 'vitest'
import { mutations } from '@/store/server/spoolman/mutations'
import { getDefaultState } from '@/store/server/spoolman/index'
import type { ServerSpoolmanState, ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

// Vue.set is used in mutations; stub it to behave like a plain assignment.
vi.mock('vue', () => ({
    default: {
        set: (obj: Record<string, any>, key: string | number, value: any) => {
            obj[key] = value
        },
    },
}))

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

describe('spoolman mutations', () => {
    // -- reset --
    describe('reset', () => {
        it('resets state to defaults', () => {
            const state: ServerSpoolmanState = {
                ...getDefaultState(),
                active_spool_id: 42,
                tool_spools: { 0: 1, 1: 2 },
                tool_spool_details: { 0: makeSpool(1), 1: makeSpool(2) },
            }
            mutations.reset(state)
            expect(state.active_spool_id).toBeNull()
            expect(state.tool_spools).toEqual({})
            expect(state.tool_spool_details).toEqual({})
        })
    })

    // -- single-tool (legacy) mutations --
    describe('setActiveSpoolId', () => {
        it('sets the active spool ID', () => {
            const state = getDefaultState()
            mutations.setActiveSpoolId(state, 5)
            expect(state.active_spool_id).toBe(5)
        })

        it('sets null to clear the spool', () => {
            const state = getDefaultState()
            state.active_spool_id = 5
            mutations.setActiveSpoolId(state, null)
            expect(state.active_spool_id).toBeNull()
        })
    })

    describe('setActiveSpool', () => {
        it('sets the active spool object', () => {
            const state = getDefaultState()
            const spool = makeSpool(10)
            mutations.setActiveSpool(state, spool)
            expect(state.active_spool).toEqual(spool)
        })

        it('clears the active spool with null', () => {
            const state = getDefaultState()
            state.active_spool = makeSpool(10)
            mutations.setActiveSpool(state, null)
            expect(state.active_spool).toBeNull()
        })
    })

    // -- multi-tool mutations --
    describe('setToolSpools', () => {
        it('sets the full tool-to-spool map', () => {
            const state = getDefaultState()
            const map = { 0: 100, 1: 200 }
            mutations.setToolSpools(state, map)
            expect(state.tool_spools).toEqual({ 0: 100, 1: 200 })
        })

        it('handles map with null values (unassigned tools)', () => {
            const state = getDefaultState()
            const map: Record<number, number | null> = { 0: 100, 1: null }
            mutations.setToolSpools(state, map)
            expect(state.tool_spools[0]).toBe(100)
            expect(state.tool_spools[1]).toBeNull()
        })

        it('replaces existing map', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 1, 1: 2 }
            mutations.setToolSpools(state, { 0: 99 })
            expect(state.tool_spools).toEqual({ 0: 99 })
        })
    })

    describe('setToolSpool', () => {
        it('sets spool for a specific tool', () => {
            const state = getDefaultState()
            mutations.setToolSpool(state, { tool: 0, spool_id: 42 })
            expect(state.tool_spools[0]).toBe(42)
        })

        it('sets spool for tool 1 independently of tool 0', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 10 }
            mutations.setToolSpool(state, { tool: 1, spool_id: 20 })
            expect(state.tool_spools[0]).toBe(10)
            expect(state.tool_spools[1]).toBe(20)
        })

        it('clears spool with null (eject)', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 10, 1: 20 }
            mutations.setToolSpool(state, { tool: 1, spool_id: null })
            expect(state.tool_spools[0]).toBe(10)
            expect(state.tool_spools[1]).toBeNull()
        })

        it('invalidates cached detail on eject', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 10 }
            state.tool_spool_details = { 0: makeSpool(10) }
            mutations.setToolSpool(state, { tool: 0, spool_id: null })
            expect(state.tool_spool_details[0]).toBeNull()
        })

        it('invalidates cached detail when spool changes', () => {
            const state = getDefaultState()
            state.tool_spools = { 0: 10 }
            state.tool_spool_details = { 0: makeSpool(10) }
            mutations.setToolSpool(state, { tool: 0, spool_id: 20 })
            expect(state.tool_spool_details[0]).toBeNull()
        })

        it('keeps cached detail when spool id is unchanged', () => {
            const state = getDefaultState()
            const spool = makeSpool(10)
            state.tool_spools = { 0: 10 }
            state.tool_spool_details = { 0: spool }
            mutations.setToolSpool(state, { tool: 0, spool_id: 10 })
            expect(state.tool_spool_details[0]).toEqual(spool)
        })
    })

    describe('setToolSpoolDetail', () => {
        it('stores full spool detail for a tool', () => {
            const state = getDefaultState()
            const spool = makeSpool(5, 'PETG')
            mutations.setToolSpoolDetail(state, { tool: 0, spool })
            expect(state.tool_spool_details[0]).toEqual(spool)
            expect(state.tool_spool_details[0]?.filament.material).toBe('PETG')
        })

        it('stores details for multiple tools', () => {
            const state = getDefaultState()
            const spool0 = makeSpool(5, 'PLA')
            const spool1 = makeSpool(6, 'ABS')
            mutations.setToolSpoolDetail(state, { tool: 0, spool: spool0 })
            mutations.setToolSpoolDetail(state, { tool: 1, spool: spool1 })
            expect(state.tool_spool_details[0]?.id).toBe(5)
            expect(state.tool_spool_details[1]?.id).toBe(6)
        })

        it('clears detail with null', () => {
            const state = getDefaultState()
            state.tool_spool_details = { 0: makeSpool(5) }
            mutations.setToolSpoolDetail(state, { tool: 0, spool: null })
            expect(state.tool_spool_details[0]).toBeNull()
        })
    })
})
