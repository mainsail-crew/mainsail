import { describe, expect, it } from 'vitest'
import { getters } from '@/store/printer/getters'
import type { PrinterState, PrinterStateMacro } from '@/store/printer/types'
import type { RootState } from '@/store/types'

const runGetter = (state: Record<string, unknown>): PrinterStateMacro[] => {
    return getters.getMacros(state as unknown as PrinterState, {}, {} as RootState, {})
}

describe('printer/getMacros', () => {
    it('does not throw when configfile.settings is missing', () => {
        expect(() => runGetter({ configfile: {}, 'gcode_macro START_PRINT': {} })).not.toThrow()
    })
})
