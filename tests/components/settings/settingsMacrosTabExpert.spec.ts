import { describe, expect, it } from 'vitest'
import SettingsMacrosTabExpert from '@/components/settings/SettingsMacrosTabExpert.vue'
import type { PrinterStateMacro } from '@/store/printer/types'
import type { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'

type ComponentOptions = {
    macros?: Partial<PrinterStateMacro>[]
    group?: Partial<GuiMacrosStateMacrogroup>
    search?: string | null
    klipperReady?: boolean
}

interface MacrosTabExpert {
    searchMacros: string | null
    editGroupId: string | null
    allMacros: PrinterStateMacro[]
    filteredMacros: PrinterStateMacro[]
    availableMacros: PrinterStateMacro[]
    macroListLoaded: boolean
    existsMacro(macroname: string): boolean
    getMacroDescription(macroname: string): string | null
}

const MacrosTabExpertClass = SettingsMacrosTabExpert as unknown as new () => MacrosTabExpert

const createComponent = (options: ComponentOptions = {}) => {
    const klipperReady = options.klipperReady ?? true

    const component = new MacrosTabExpertClass()

    Object.defineProperty(component, '$store', {
        value: {
            state: {
                socket: { isConnected: klipperReady },
                server: {
                    klippy_connected: klipperReady,
                    klippy_state: klipperReady ? 'ready' : 'shutdown',
                },
            },
            getters: {
                'printer/getMacros': options.macros ?? [],
                'gui/macros/getMacrogroup': () => options.group,
            },
        },
    })

    Object.defineProperty(component, '$t', { value: (key: string) => key })

    component.searchMacros = 'search' in options ? (options.search as string | null) : ''
    component.editGroupId = 'group-1'

    return component
}

const macroNames = (macros: PrinterStateMacro[]) => macros.map((macro) => macro.name)

describe('SettingsMacrosTabExpert', () => {
    describe('the search field only filters the available macros', () => {
        it('keeps a group macro recognized while the search hides it', () => {
            const component = createComponent({
                macros: [{ name: 'START_PRINT' }, { name: 'END_PRINT' }],
                search: 'START',
            })

            expect(component.existsMacro('END_PRINT')).toBe(true)
        })

        it('keeps returning the real description of a macro hidden by the search', () => {
            const component = createComponent({
                macros: [
                    { name: 'START_PRINT', description: 'Heats up and homes' },
                    { name: 'END_PRINT', description: 'Parks the toolhead' },
                ],
                search: 'START',
            })

            expect(component.getMacroDescription('END_PRINT')).toBe('Parks the toolhead')
        })

        it('still narrows the available macros list by name', () => {
            const component = createComponent({
                macros: [{ name: 'START_PRINT' }, { name: 'END_PRINT' }],
                search: 'end',
            })

            expect(macroNames(component.availableMacros)).toStrictEqual(['END_PRINT'])
        })

        it('still narrows the available macros list by description', () => {
            const component = createComponent({
                macros: [
                    { name: 'START_PRINT', description: 'Heats up and homes' },
                    { name: 'END_PRINT', description: 'Parks the toolhead' },
                ],
                search: 'parks',
            })

            expect(macroNames(component.availableMacros)).toStrictEqual(['END_PRINT'])
        })

        it('excludes macros already used in the edited group', () => {
            const component = createComponent({
                macros: [{ name: 'START_PRINT' }, { name: 'END_PRINT' }],
                group: { macros: [{ name: 'START_PRINT', pos: 1 }] as GuiMacrosStateMacrogroup['macros'] },
            })

            expect(macroNames(component.availableMacros)).toStrictEqual(['END_PRINT'])
        })
    })

    describe('a cleared search field', () => {
        it('does not throw when the search is null', () => {
            const component = createComponent({
                macros: [{ name: 'START_PRINT' }],
                search: null,
            })

            expect(() => component.availableMacros).not.toThrow()
            expect(macroNames(component.availableMacros)).toStrictEqual(['START_PRINT'])
        })

        it('does not throw when a macro has no description', () => {
            const component = createComponent({
                macros: [{ name: 'START_PRINT', description: null }],
                search: 'nomatch',
            })

            expect(() => component.availableMacros).not.toThrow()
            expect(component.availableMacros).toStrictEqual([])
        })
    })

    describe('deleted macro detection', () => {
        it('reports a macro that is no longer in the config as deleted', () => {
            const component = createComponent({ macros: [{ name: 'START_PRINT' }] })

            expect(component.existsMacro('REMOVED_MACRO')).toBe(false)
            expect(component.getMacroDescription('REMOVED_MACRO')).toBe('Settings.MacrosTab.DeletedMacro')
        })

        it('matches macro names case-insensitively', () => {
            const component = createComponent({ macros: [{ name: 'Start_Print' }] })

            expect(component.existsMacro('START_PRINT')).toBe(true)
            expect(component.existsMacro('start_print')).toBe(true)
        })

        it('returns null instead of a description when the macro has no help text', () => {
            const component = createComponent({ macros: [{ name: 'START_PRINT' }] })

            expect(component.getMacroDescription('START_PRINT')).toBeNull()
        })

        it('does not report macros as deleted while klipper is not ready', () => {
            const component = createComponent({ macros: [], klipperReady: false })

            expect(component.existsMacro('START_PRINT')).toBe(true)
            expect(component.getMacroDescription('START_PRINT')).toBeNull()
        })

        it('reports a macro as deleted once klipper is ready with a genuinely empty macro list', () => {
            const component = createComponent({ macros: [], klipperReady: true })

            expect(component.existsMacro('START_PRINT')).toBe(false)
            expect(component.getMacroDescription('START_PRINT')).toBe('Settings.MacrosTab.DeletedMacro')
        })
    })
})
