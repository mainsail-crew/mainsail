import { describe, expect, it, vi } from 'vitest'
import SettingsMacrosTabSimple from '@/components/settings/SettingsMacrosTabSimple.vue'
import type { PrinterStateMacro } from '@/store/printer/types'

type ComponentOptions = {
    macros?: Partial<PrinterStateMacro>[]
    hiddenMacros?: string[]
    search?: string | null
}

interface MacrosTabSimple {
    searchMacros: string | null
    macros: PrinterStateMacro[]
    hiddenMacros: string[]
    getMacroStatus(name: string): boolean
    changeMacroStatus(name: string): void
}

const MacrosTabSimpleClass = SettingsMacrosTabSimple as unknown as new () => MacrosTabSimple

const createComponent = (options: ComponentOptions = {}) => {
    const dispatch = vi.fn()
    const component = new MacrosTabSimpleClass()

    Object.defineProperty(component, '$store', {
        value: {
            state: {
                gui: { macros: { hiddenMacros: options.hiddenMacros ?? [] } },
            },
            getters: {
                'printer/getMacros': options.macros ?? [],
            },
            dispatch,
        },
    })

    component.searchMacros = 'search' in options ? (options.search as string | null) : ''

    return { component, dispatch }
}

const macroNames = (macros: PrinterStateMacro[]) => macros.map((macro) => macro.name)

describe('SettingsMacrosTabSimple', () => {
    describe('search', () => {
        it('filters by macro name', () => {
            const { component } = createComponent({
                macros: [{ name: 'START_PRINT' }, { name: 'END_PRINT' }],
                search: 'end',
            })

            expect(macroNames(component.macros)).toStrictEqual(['END_PRINT'])
        })

        it('filters by macro description', () => {
            const { component } = createComponent({
                macros: [
                    { name: 'START_PRINT', description: 'Heats up and homes' },
                    { name: 'END_PRINT', description: 'Parks the toolhead' },
                ],
                search: 'parks',
            })

            expect(macroNames(component.macros)).toStrictEqual(['END_PRINT'])
        })

        it('does not throw and lists every macro when the search is null', () => {
            const { component } = createComponent({
                macros: [{ name: 'START_PRINT' }, { name: 'END_PRINT' }],
                search: null,
            })

            expect(() => component.macros).not.toThrow()
            expect(macroNames(component.macros)).toStrictEqual(['START_PRINT', 'END_PRINT'])
        })

        it('does not throw when a macro has no description', () => {
            const { component } = createComponent({
                macros: [{ name: 'START_PRINT', description: null }],
                search: 'nomatch',
            })

            expect(() => component.macros).not.toThrow()
            expect(component.macros).toStrictEqual([])
        })
    })

    describe('hiding macros', () => {
        it('reports a macro as enabled when it is not hidden', () => {
            const { component } = createComponent({ hiddenMacros: ['END_PRINT'] })

            expect(component.getMacroStatus('START_PRINT')).toBe(true)
            expect(component.getMacroStatus('END_PRINT')).toBe(false)
        })

        it('hides a visible macro', () => {
            const { component, dispatch } = createComponent({ hiddenMacros: [] })

            component.changeMacroStatus('Start_Print')

            expect(dispatch).toHaveBeenCalledWith('gui/macros/saveSetting', {
                name: 'hiddenMacros',
                value: ['START_PRINT'],
            })
        })

        it('unhides an already hidden macro', () => {
            const { component, dispatch } = createComponent({ hiddenMacros: ['START_PRINT', 'END_PRINT'] })

            component.changeMacroStatus('START_PRINT')

            expect(dispatch).toHaveBeenCalledWith('gui/macros/saveSetting', {
                name: 'hiddenMacros',
                value: ['END_PRINT'],
            })
        })
    })
})
