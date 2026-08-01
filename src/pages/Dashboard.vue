<template>
    <div class="dashboard" :class="{ 'dashboard--dragging': dragging }">
        <v-row>
            <v-col v-for="column in columns" :key="`dashboard-column-${column.index}`" :class="column.class">
                <status-panel v-if="column.index < 2" />
                <draggable
                    :value="panelsByColumn[column.index]"
                    :group="dragGroup"
                    :handle="dragHandle"
                    :touch-start-threshold="5"
                    :animation="200"
                    :force-fallback="true"
                    class="dashboard-dropzone"
                    ghost-class="dashboard-panel--placeholder"
                    drag-class="dashboard-panel--dragged"
                    fallback-class="dashboard-panel--dragged"
                    @choose="dragging = true"
                    @unchoose="dragEnd"
                    @start="dragStart"
                    @end="dragEnd"
                    @input="saveColumn(column.index, $event)">
                    <component
                        :is="extractPanelName(component.name)"
                        v-for="component in panelsByColumn[column.index]"
                        :key="`dashboard-${viewport}-${column.index}-${component.name}`"
                        :panel-id="extractPanelId(component.name)"></component>
                </draggable>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import AfcPanel from '@/components/panels/AfcPanel.vue'
import ExtruderControlPanel from '@/components/panels/ExtruderControlPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import LedEffectsPanel from '@/components/panels/LedEffectsPanel.vue'
import MachineSettingsPanel from '@/components/panels/MachineSettingsPanel.vue'
import MacrogroupPanel from '@/components/panels/MacrogroupPanel.vue'
import MacrosPanel from '@/components/panels/MacrosPanel.vue'
import MiniconsolePanel from '@/components/panels/MiniconsolePanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MiscellaneousPanel from '@/components/panels/MiscellaneousPanel.vue'
import SpoolmanPanel from '@/components/panels/SpoolmanPanel.vue'
import MmuPanel from '@/components/panels/MmuPanel.vue'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import ToolheadControlPanel from '@/components/panels/ToolheadControlPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'
import { GuiStateDashboard, GuiStateLayoutoption } from '@/store/gui/types'

interface DashboardColumn {
    index: number
    class: string
}

interface LayoutFixedPanel {
    panel: GuiStateLayoutoption
    predecessor: string | null
    successor: string | null
}

@Component({
    components: {
        AfcPanel,
        draggable,
        ExtruderControlPanel,
        KlippyStatePanel,
        LedEffectsPanel,
        MachineSettingsPanel,
        MacrogroupPanel,
        MacrosPanel,
        MiniconsolePanel,
        MinSettingsPanel,
        MiscellaneousPanel,
        SpoolmanPanel,
        MmuPanel,
        StatusPanel,
        ToolheadControlPanel,
        TemperaturePanel,
        WebcamPanel,
    },
})
export default class PageDashboard extends Mixins(DashboardMixin) {
    dragHandle = '.panel-header-icon'
    dragGroup = 'dashboard-panels'

    dragging = false
    resizeObserver: ResizeObserver | null = null

    get columns(): DashboardColumn[] {
        switch (this.viewport) {
            case 'mobile':
                return [{ index: 0, class: '' }]

            case 'tablet':
                return [
                    { index: 1, class: 'col-6' },
                    { index: 2, class: 'col-6' },
                ]

            case 'desktop':
                return [
                    { index: 1, class: 'col-5' },
                    { index: 2, class: 'col-7' },
                ]

            default:
                return [
                    { index: 1, class: 'col-3' },
                    { index: 2, class: 'col-5' },
                    { index: 3, class: 'col-4' },
                ]
        }
    }

    get panelsByColumn(): Record<number, GuiStateLayoutoption[]> {
        const output: Record<number, GuiStateLayoutoption[]> = {}
        this.columns.forEach((column) => {
            output[column.index] = this.$store.getters['gui/getPanels'](this.viewport, column.index, true)
        })

        return output
    }

    extractPanelName(name: string) {
        return name.split('_')[0] + '-panel'
    }

    extractPanelId(name: string) {
        return name.split('_')[1] ?? null
    }

    dragStart(event: { item: HTMLElement }) {
        this.resizeObserver = new ResizeObserver(() => {
            const clone = document.querySelector<HTMLElement>('.dashboard-panel--dragged')
            if (clone === null) return

            clone.style.width = `${event.item.offsetWidth}px`
            clone.style.height = `${event.item.offsetHeight}px`
        })
        this.resizeObserver.observe(event.item)
    }

    dragEnd() {
        this.dragging = false
        this.resizeObserver?.disconnect()
        this.resizeObserver = null
    }

    getStoredPanels(viewport: string, column: number): GuiStateLayoutoption[] {
        const layoutName = (column ? `${viewport}Layout${column}` : `${viewport}Layout`) as keyof GuiStateDashboard
        const panels = this.$store.state.gui.dashboard[layoutName] as GuiStateLayoutoption[]

        return panels?.filter((element) => element !== null) ?? []
    }

    mergeLayout(
        storedPanels: GuiStateLayoutoption[],
        oldPanels: GuiStateLayoutoption[],
        newPanels: GuiStateLayoutoption[]
    ): GuiStateLayoutoption[] {
        const draggableNames = new Set(oldPanels.map((panel) => panel.name))
        const storedByName = new Map(storedPanels.map((panel) => [panel.name, panel]))

        const output = newPanels.map((panel) => storedByName.get(panel.name) ?? { name: panel.name, visible: true })
        const movableNames = new Set(output.map((panel) => panel.name))

        const fixedPanels: LayoutFixedPanel[] = []
        let predecessor: string | null = null
        storedPanels.forEach((panel) => {
            if (draggableNames.has(panel.name)) {
                fixedPanels.forEach((entry) => {
                    if (entry.successor === null) entry.successor = panel.name
                })

                predecessor = panel.name
                return
            }

            fixedPanels.push({ panel, predecessor, successor: null })
        })

        fixedPanels.forEach((entry) => {
            let index = output.length

            if (entry.predecessor !== null && movableNames.has(entry.predecessor)) {
                index = output.findIndex((panel) => panel.name === entry.predecessor) + 1
                while (index < output.length && !movableNames.has(output[index].name)) index++
            } else if (entry.successor !== null && movableNames.has(entry.successor)) {
                index = output.findIndex((panel) => panel.name === entry.successor)
            }

            output.splice(index, 0, entry.panel)
        })

        return output
    }

    saveColumn(column: number, panels: GuiStateLayoutoption[]) {
        const layoutName = column ? `${this.viewport}Layout${column}` : `${this.viewport}Layout`
        const storedPanels = this.getStoredPanels(this.viewport, column)

        this.$store.dispatch('gui/saveSetting', {
            name: `dashboard.${layoutName}`,
            value: this.mergeLayout(storedPanels, this.panelsByColumn[column] ?? [], panels),
        })
    }
}
</script>

<style scoped>
.dashboard-dropzone {
    min-height: 64px;
    border-radius: 8px;
    outline: 2px dotted transparent;
    outline-offset: 6px;
    transition:
        outline-color 150ms ease-in-out,
        background-color 150ms ease-in-out;
}

.dashboard--dragging .dashboard-dropzone {
    outline-color: var(--v-primary-base);
    background-color: rgba(125, 125, 125, 0.06);
}

.dashboard-dropzone ::v-deep .panel-header-icon {
    cursor: grab;
    user-select: none;
    -webkit-touch-callout: none;
}

.dashboard--dragging {
    cursor: grabbing;
}

.dashboard--dragging ::v-deep .panel > * {
    pointer-events: none;
}

.dashboard-panel--placeholder {
    opacity: 0.5;
}

.dashboard-panel--dragged {
    background-color: rgba(125, 125, 125, 0.15) !important;
    box-shadow: none !important;
    pointer-events: none;
}

.dashboard-panel--dragged ::v-deep > *:not(.panel-toolbar) {
    display: none !important;
}
</style>
