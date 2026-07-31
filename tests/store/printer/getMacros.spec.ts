import { describe, expect, it } from 'vitest'
import { getters } from '@/store/printer/getters'
import type { PrinterState, PrinterStateMacro } from '@/store/printer/types'
import type { RootState } from '@/store/types'

const runGetter = (state: Record<string, unknown>): PrinterStateMacro[] => {
    return getters.getMacros(state as unknown as PrinterState, {}, {} as RootState, {})
}

describe('printer/getMacros', () => {
    it('returns the gcode_macro objects with their help text as description', () => {
        const macros = runGetter({
            configfile: { settings: { 'gcode_macro start_print': { gcode: 'G28' } } },
            gcode: { commands: { START_PRINT: { help: 'Heats up and homes' } } },
            'gcode_macro START_PRINT': { bed_temp: 60 },
        })

        expect(macros).toHaveLength(1)
        expect(macros[0].name).toBe('START_PRINT')
        expect(macros[0].description).toBe('Heats up and homes')
        expect(macros[0].variables).toStrictEqual({ bed_temp: 60 })
    })

    it('sorts the macros case-insensitively', () => {
        const macros = runGetter({
            configfile: { settings: {} },
            'gcode_macro zzz_macro': {},
            'gcode_macro Alpha': {},
            'gcode_macro beta': {},
        })

        expect(macros.map((macro) => macro.name)).toStrictEqual(['Alpha', 'beta', 'zzz_macro'])
    })

    it('hides macros starting with an underscore', () => {
        const macros = runGetter({
            configfile: { settings: {} },
            'gcode_macro _INTERNAL': {},
            'gcode_macro START_PRINT': {},
        })

        expect(macros.map((macro) => macro.name)).toStrictEqual(['START_PRINT'])
    })

    it('hides macros that override an existing command via rename_existing', () => {
        const macros = runGetter({
            configfile: {
                settings: {
                    'gcode_macro pause': { rename_existing: 'BASE_PAUSE' },
                },
            },
            'gcode_macro PAUSE': {},
            'gcode_macro START_PRINT': {},
        })

        expect(macros.map((macro) => macro.name)).toStrictEqual(['START_PRINT'])
    })

    it('sets the description to null when the macro has no help text', () => {
        const macros = runGetter({
            configfile: { settings: {} },
            gcode: { commands: {} },
            'gcode_macro START_PRINT': {},
        })

        expect(macros[0].description).toBeNull()
    })

    it('does not throw when configfile is missing', () => {
        expect(() => runGetter({ 'gcode_macro START_PRINT': {} })).not.toThrow()
        expect(runGetter({ 'gcode_macro START_PRINT': {} }).map((macro) => macro.name)).toStrictEqual(['START_PRINT'])
    })

    it('does not throw when configfile.settings is missing', () => {
        expect(() => runGetter({ configfile: {}, 'gcode_macro START_PRINT': {} })).not.toThrow()
    })

    it('returns an empty list when no printer objects are loaded', () => {
        expect(runGetter({})).toStrictEqual([])
    })
})
