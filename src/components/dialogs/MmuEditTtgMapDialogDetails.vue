<template>
    <v-row>
        <v-col cols="4" class="d-flex align-center">
            <v-list v-if="fileNeedsTool">
                <v-list-item>
                    <v-list-item-content>
                        <div class="text-overline">{{ $t('Panels.MmuPanel.TtgMapDialog.SlicerExpects') }}</div>
                        <v-divider />
                        <div class="mb-2 mt-2">
                            <span class="tool-swatch mr-1" :style="'background-color: ' + fileFilamentColor" />
                            {{ toolName }}
                        </div>
                        <v-list-item-title class="wrap-tool-name">{{ fileFilamentName }}</v-list-item-title>
                        <v-list-item-subtitle>{{ fileFilamentDetails }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <div v-else class="body-2 text--secondary">{{ toolRowText }}</div>
        </v-col>
        <v-col cols="1" class="d-flex justify-center align-center">
            <span class="triangle" />
        </v-col>
        <v-col cols="7" class="pa-0 minwidth-0">
            <v-data-table
                :headers="gateTableHeaders"
                :items="gateItems"
                item-key="index"
                sort-by="index"
                class="drop-down-table"
                :items-per-page="-1"
                hide-default-footer>
                <template #no-data>
                    <div class="text-center">
                        {{ $t('Panels.MmuPanel.TtgMapDialog.NoGateData') }}
                    </div>
                </template>

                <template #item="{ item }">
                    <mmu-edit-ttg-map-dialog-details-row
                        :key="item"
                        :ref="`ttg-map-row-${item}`"
                        :gate="item"
                        :selected-gate="selectedGate"
                        @select-gate="selectGate(item)"
                        @select-endless-spool-group="selectEndlessSpoolGroup(item)" />
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { GATE_UNKNOWN, TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import { FileStateGcodefile } from '@/store/files/types'
import Vue from 'vue'

@Component
export default class MmuEditTtgMapDialogDetails extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly tool!: number
    @Prop({ default: null }) readonly file!: FileStateGcodefile | null

    get toolName() {
        if (this.tool === TOOL_GATE_BYPASS) return this.$t('Panels.MmuPanel.TtgMapDialog.Bypass')

        return `T${this.tool}`
    }

    get toolRowText() {
        if (this.file && this.fileFilamentWeight === 0)
            return this.$t('Panels.MmuPanel.TtgMapDialog.ToolNotUsed', { tool: this.toolName })

        return this.$t('Panels.MmuPanel.TtgMapDialog.NoSlicerInfo', { tool: this.toolName })
    }

    get fileNeedsTool() {
        return this.file && this.fileFilamentWeight > 0
    }

    get fileFilamentColor() {
        let colors = this.file?.extruder_colors ?? []
        if (['BambuStudio', 'OrcaSlicer'].includes(this.file?.slicer ?? '')) {
            colors = this.file?.filament_colors ?? []
        }

        return this.formColorString(colors[this.tool] ?? '')
    }

    get fileFilamentName() {
        const names = (this.file?.filament_name ?? '').replace(/"/g, '').split(';')

        return names[this.tool]?.trim() ?? 'Unknown'
    }

    get fileFilamentTemp() {
        const temps = this.file?.filament_temps ?? []

        return temps[this.tool] ?? 0
    }

    get fileFilamentType() {
        const types = (this.file?.filament_type ?? '').replace(/"/g, '').split(';')

        return types[this.tool]?.trim() ?? 'Unknown'
    }

    get fileFilamentWeight() {
        const weights = this.file?.filament_weights ?? []

        return weights[this.tool] ?? 0
    }

    get fileFilamentDetails() {
        const details = [this.fileFilamentType]
        if (this.fileFilamentTemp) {
            details.push(this.fileFilamentTemp + '°C')
        }

        return details.join(' | ')
    }

    get gateItems() {
        const gates = []
        for (let i = 0; i < this.mmu?.num_gates!; i++) {
            gates.push(i)
        }

        return gates
    }

    get gateTableHeaders() {
        if (this.tool < 0) return []

        return [
            {
                text: this.$t('Panels.MmuPanel.TtgMapDialog.Gate'),
                align: 'center',
                value: 'index',
                sortable: false,
            },
            {
                text: '',
                align: 'center',
                sortable: false,
            },
            {
                text: this.$t('Panels.MmuPanel.TtgMapDialog.FilamentInfo'),
                align: 'start',
                sortable: false,
            },
            {
                text: this.$t('Panels.MmuPanel.TtgMapDialog.EndlessSpool'),
                align: 'right',
                sortable: false,
            },
        ]
    }

    get selectedGate() {
        return this.ttgMap[this.tool] ?? null
    }

    selectGate(gate: number) {
        this.doSend(`MMU_REMAP_TTG TOOL=${this.tool} GATE=${gate} QUIET=1`)
    }

    selectEndlessSpoolGroup(gate: number) {
        if (gate === GATE_UNKNOWN) return

        // copy the array to change one value
        const groups = [...this.endlessSpoolGroups]
        // get the current group of the selected gate
        const selectedGroup = groups[this.selectedGate]
        // toggle the group of the clicked gate
        groups[gate] = groups[gate] === selectedGroup ? gate : selectedGroup

        this.doSend(`MMU_ENDLESS_SPOOL GROUPS="${groups.join(',')}" QUIET=1`)
    }

    mounted() {
        this.scrollToSelectedGate()
    }

    @Watch('tool')
    onToolChanged() {
        this.scrollToSelectedGate()
    }

    scrollToSelectedGate() {
        this.$nextTick(() => {
            const element = (this.$refs[`ttg-map-row-${this.selectedGate}`] as Vue)?.$el as HTMLTableRowElement
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
    }
}
</script>

<style scoped>
.tool-swatch {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid lightgray;
    vertical-align: middle;
}

.triangle {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 40px 0 40px 15px;
    border-color: transparent transparent transparent #595959;
}

::v-deep .drop-down-table .v-data-table__wrapper {
    height: 300px;
    overflow-y: auto;
}

::v-deep .drop-down-table .v-data-table__wrapper table {
    table-layout: fixed;
    width: 100%;
}

::v-deep .drop-down-table table th:nth-child(1),
::v-deep .drop-down-table table th:nth-child(4) {
    width: 64px;
}

::v-deep .drop-down-table table th:nth-child(2) {
    width: 36px;
}
</style>
