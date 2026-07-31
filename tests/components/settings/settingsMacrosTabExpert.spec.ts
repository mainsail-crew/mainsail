import { describe, expect, it } from 'vitest'
import SettingsMacrosTabExpert from '@/components/settings/SettingsMacrosTabExpert.vue'
import type { PrinterStateMacro } from '@/store/printer/types'
import type { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'

type ComponentOptions = {
    macros?: Partial<PrinterStateMacro>[]
    group?: Partial<GuiMacrosStateMacrogroup>
    search?: string | null
}

interface MacrosTabExpert {
    searchMacros: string | null
    editGroupId: string | null
    allMacros: PrinterStateMacro[]
    availableMacros: PrinterStateMacro[]
}

const MacrosTabExpertClass = SettingsMacrosTabExpert as unknown as new () => MacrosTabExpert

const createComponent = (options: ComponentOptions = {}) => {
    const component = new MacrosTabExpertClass()

    Object.defineProperty(component, '$store', {
        value: {
            getters: {
                'printer/getMacros': options.macros ?? [],
                'gui/macros/getMacrogroup': () => options.group,
            },
        },
    })

    component.searchMacros = 'search' in options ? (options.search as string | null) : ''
    component.editGroupId = 'group-1'

    return component
}

const macroNames = (macros: PrinterStateMacro[]) => macros.map((macro) => macro.name)

describe('SettingsMacrosTabExpert', () => {
    describe('search', () => {
        it('filters by macro name', () => {
            const component = createComponent({
                macros: [{ name: 'START_PRINT' }, { name: 'END_PRINT' }],
                search: 'end',
            })

            expect(macroNames(component.availableMacros)).toStrictEqual(['END_PRINT'])
        })

        it('filters by macro description', () => {
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
})
