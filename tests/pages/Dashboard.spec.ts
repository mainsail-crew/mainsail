import { describe, expect, it } from 'vitest'
import PageDashboardComponent from '@/pages/Dashboard.vue'
import { GuiStateLayoutoption } from '@/store/gui/types'

const PageDashboard = PageDashboardComponent as unknown as {
    new (): {
        mergeLayout(
            storedPanels: GuiStateLayoutoption[],
            oldPanels: GuiStateLayoutoption[],
            newPanels: GuiStateLayoutoption[]
        ): GuiStateLayoutoption[]
    }
}

const panel = (name: string, visible = true): GuiStateLayoutoption => ({ name, visible })
const names = (panels: GuiStateLayoutoption[]) => panels.map((entry) => entry.name)

const page = new PageDashboard()

describe('PageDashboard.mergeLayout', () => {
    it('applies a new order of the visible panels', () => {
        const stored = [panel('webcam'), panel('toolhead-control'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('toolhead-control'), panel('temperature')]
        const newPanels = [panel('temperature'), panel('webcam'), panel('toolhead-control')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual([
            'temperature',
            'webcam',
            'toolhead-control',
        ])
    })

    it('keeps hidden panels behind the panel they were stored after', () => {
        const stored = [panel('webcam'), panel('macros', false), panel('toolhead-control'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('toolhead-control'), panel('temperature')]
        const newPanels = [panel('toolhead-control'), panel('temperature'), panel('webcam')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual([
            'toolhead-control',
            'temperature',
            'webcam',
            'macros',
        ])
    })

    it('keeps hidden panels without a predecessor in front of their successor', () => {
        const stored = [panel('macros', false), panel('webcam'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('temperature')]
        const newPanels = [panel('temperature'), panel('webcam')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual([
            'temperature',
            'macros',
            'webcam',
        ])
    })

    it('keeps hidden panels in front of their successor, when their predecessor moved away', () => {
        const stored = [panel('toolhead-control'), panel('macros', false), panel('webcam'), panel('temperature')]
        const oldPanels = [panel('toolhead-control'), panel('webcam'), panel('temperature')]
        const newPanels = [panel('webcam'), panel('temperature')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual([
            'macros',
            'webcam',
            'temperature',
        ])
    })

    it('keeps the stored order of multiple hidden panels sharing a predecessor', () => {
        const stored = [panel('webcam'), panel('macros', false), panel('miniconsole', false), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('temperature')]
        const newPanels = [panel('temperature'), panel('webcam')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual([
            'temperature',
            'webcam',
            'macros',
            'miniconsole',
        ])
    })

    it('keeps currently unavailable panels, which are not rendered at all', () => {
        const stored = [panel('webcam'), panel('spoolman'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('temperature')]
        const newPanels = [panel('temperature'), panel('webcam')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual([
            'temperature',
            'webcam',
            'spoolman',
        ])
    })

    it('removes a panel which was dragged into another column', () => {
        const stored = [panel('webcam'), panel('toolhead-control'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('toolhead-control'), panel('temperature')]
        const newPanels = [panel('webcam'), panel('temperature')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual(['webcam', 'temperature'])
    })

    it('keeps hidden panels of a column, when their anchor panel is dragged away', () => {
        const stored = [panel('webcam'), panel('toolhead-control'), panel('macros', false)]
        const oldPanels = [panel('webcam'), panel('toolhead-control')]
        const newPanels = [panel('webcam')]

        expect(names(page.mergeLayout(stored, oldPanels, newPanels))).toStrictEqual(['webcam', 'macros'])
    })

    it('adds a panel which was dragged in from another column', () => {
        const stored = [panel('webcam'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('temperature')]
        const newPanels = [panel('webcam'), panel('toolhead-control'), panel('temperature')]

        expect(page.mergeLayout(stored, oldPanels, newPanels)).toStrictEqual([
            panel('webcam'),
            panel('toolhead-control'),
            panel('temperature'),
        ])
    })

    it('preserves the visible flag of the stored entries', () => {
        const stored = [panel('webcam'), panel('temperature')]
        const oldPanels = [panel('webcam'), panel('temperature')]
        const newPanels = [panel('temperature', false), panel('webcam', false)]

        expect(page.mergeLayout(stored, oldPanels, newPanels)).toStrictEqual([panel('temperature'), panel('webcam')])
    })

    it('materializes panels which were only added implicitly by the getter', () => {
        const stored = [panel('webcam')]
        const oldPanels = [panel('webcam'), panel('temperature')]
        const newPanels = [panel('temperature'), panel('webcam')]

        expect(page.mergeLayout(stored, oldPanels, newPanels)).toStrictEqual([panel('temperature'), panel('webcam')])
    })
})
