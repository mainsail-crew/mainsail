<template>
    <panel v-if="showPanel" :icon="mdiMulticast" :title="title" :collapsible="true" card-class="mmu-panel">
        <template #buttons>
            <v-menu left offset-y :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small class="w-100" @click="showEditTtgMapDialog = true">
                            {{ $t('Panels.MmuPanel.EditTtgMap') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small class="w-100" @click="showEditGateMapDialog = true">
                            {{ $t('Panels.MmuPanel.EditGateMap') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small class="w-100" :disabled="!canSend" @click="showRecoverStateDialog = true">
                            {{ $t('Panels.MmuPanel.RecoverState') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small class="w-100" :disabled="!canSend" @click="showMaintenanceDialog = true">
                            {{ $t('Panels.MmuPanel.MmuMaintenance') }}
                        </v-btn>
                    </v-list-item>
                    <v-divider class="my-2" />
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn
                            small
                            class="w-100"
                            :loading="loadings.includes('mmu_stats')"
                            @click="doSend('MMU_STATS SHOWCOUNTS=1')">
                            <v-icon left>{{ mdiNoteText }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonPrintStats') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item
                        :disabled="!enabled || mmuSpoolmanSupport === 'off'"
                        :class="{ 'mmu-disabled': !enabled || mmuSpoolmanSupport === 'off' }">
                        <v-btn
                            small
                            class="w-100"
                            :loading="loadings.includes('mmu_spoolman')"
                            @click="handleSyncSpoolman()">
                            <v-icon left>{{ mdiRefresh }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonSyncSpoolman') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn
                            small
                            class="w-100"
                            :disabled="!canSend"
                            :loading="loadings.includes('mmu_check_gates')"
                            @click="doSend('MMU_CHECK_GATES')">
                            <v-icon left>{{ mdiCheckAll }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonCheckAllGates') }}
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-menu>
            <mmu-panel-settings />
        </template>

        <v-card-text :class="{ 'mmu-disabled': !enabled }">
            <v-row>
                <v-col class="pb-0">
                    <MmuUnit
                        v-for="i in mmuNumUnits"
                        :key="i"
                        :selected-gate="mmuGate"
                        :unit-index="i - 1"
                        :show-details="true"
                        @select-gate="selectGate" />
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="col1Size">
                    <div class="text--disabled body-2">{{ toolchangeText }}</div>
                    <div class="text-center body-1">{{ statusText }}</div>
                    <mmu-filament-status />
                    <div v-if="showClogDetection" class="text-center">
                        <mmu-clog-meter width="40%" />
                        <mmu-flowguard-meter width="40%" />
                        <div class="text--disabled body-1">{{ $t('Panels.MmuPanel.ClogDetection') }}</div>
                    </div>
                </v-col>
                <v-col :cols="12 - col1Size">
                    <template v-if="showDetails">
                        <mmu-gate-summary :gate-index="mmuGate" />
                        <v-divider />
                    </template>
                    <mmu-controls />
                    <template v-if="showTtgMap">
                        <v-divider />
                        <div class="d-flex flex-column align-center">
                            <mmu-ttg-map
                                width="75%"
                                :selected-tool="mmuTool"
                                :selected-gate="mmuGate"
                                @click="showEditTtgMapDialog = true" />
                        </div>
                        <div class="text--disabled text-center body-1">{{ $t('Panels.MmuPanel.ToolMapping') }}</div>
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
        <template v-if="reasonForPause">
            <v-divider />
            <v-card-text class="pt-3">
                <v-row>
                    <v-col cols="auto" class="d-flex justify-center pr-0">
                        <v-icon color="error">{{ mdiInformationOutline }}</v-icon>
                    </v-col>
                    <v-col>
                        <div class="text--secondary body-1"><strong>Last Error</strong></div>
                        <div class="text--disabled body-2">{{ reasonForPause }}</div>
                    </v-col>
                </v-row>
            </v-card-text>
        </template>
        <mmu-edit-gate-map-dialog v-model="showEditGateMapDialog" />
        <mmu-edit-ttg-map-dialog v-model="showEditTtgMapDialog" :file="fileForTtgMap" />
        <mmu-recover-state-dialog v-model="showRecoverStateDialog" />
        <mmu-maintenance-dialog v-model="showMaintenanceDialog" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    ACTION_IDLE,
    ACTION_LOADING,
    ACTION_UNLOADING,
    TOOL_GATE_BYPASS,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'
import { capitalize } from '@/plugins/helpers'
import { mdiMulticast, mdiDotsVertical, mdiCheckAll, mdiNoteText, mdiInformationOutline, mdiRefresh } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import MmuPanelSettings from '@/components/panels/Mmu/MmuPanelSettings.vue'
import MmuFilamentStatus from '@/components/panels/Mmu/MmuFilamentStatus.vue'
import MmuClogMeter from '@/components/panels/Mmu/MmuClogMeter.vue'
import MmuGateSummary from '@/components/panels/Mmu/MmuGateSummary.vue'
import MmuControls from '@/components/panels/Mmu/MmuControls.vue'
import MmuTtgMap from '@/components/panels/Mmu/MmuTtgMap.vue'

@Component({
    components: {
        Panel,
        MmuPanelSettings,
        MmuFilamentStatus,
        MmuClogMeter,
        MmuGateSummary,
        MmuControls,
        MmuTtgMap,
    },
})
export default class MmuPanel extends Mixins(BaseMixin, MmuMixin) {
    mdiMulticast = mdiMulticast
    mdiDotsVertical = mdiDotsVertical
    mdiCheckAll = mdiCheckAll
    mdiNoteText = mdiNoteText
    mdiInformationOutline = mdiInformationOutline
    mdiRefresh = mdiRefresh

    showRecoverStateDialog = false
    showEditTtgMapDialog = false
    showEditGateMapDialog = false
    showMaintenanceDialog = false

    get showPanel() {
        if (!this.klipperReadyForGui) return false

        return 'mmu' in this.$store.state.printer
    }

    get enabled(): boolean {
        return this.mmu?.enabled ?? false
    }

    get title() {
        let headline = this.$t('Panels.MmuPanel.Headline').toString()
        if (!this.enabled) {
            const disabledText = this.$t('Panels.MmuPanel.Disabled').toString()

            headline += ` (${disabledText})`
        }

        return headline
    }

    get largeFilamentStatus() {
        return this.$store.state.gui.view.mmu?.largeFilamentStatus ?? false
    }

    get col1Size() {
        return this.largeFilamentStatus ? 6 : 5
    }

    selectGate(gateIndex: number) {
        if (gateIndex === TOOL_GATE_BYPASS) {
            this.doSend('MMU_SELECT BYPASS=1')
            return
        }

        this.doSend(`MMU_SELECT GATE=${gateIndex}`)
    }

    get showClogDetection() {
        return this.hasMmuEncoder && this.$store.state.gui.view.mmu.showClogDetection
    }

    get showTtgMap() {
        return this.$store.state.gui.view.mmu.showTtgMap ?? true
    }

    get showDetails() {
        return this.$store.state.gui.view.mmu.showDetails ?? true
    }

    get slicerToolMap() {
        return this.mmu?.slicer_tool_map ?? undefined
    }

    get totalToolchanges() {
        return this.slicerToolMap?.total_toolchanges ?? 0
    }

    get numToolchanges() {
        return this.mmu?.num_toolchanges ?? 0
    }

    get toolchangeText() {
        if (this.nextTool === TOOL_GATE_UNKNOWN) return ''

        const label = (t: number) => (t === TOOL_GATE_BYPASS ? 'Bypass' : `T${t}`)
        const parts: string[] = ['Changing tool']
        if (this.lastTool !== TOOL_GATE_UNKNOWN) {
            parts.push('from', label(this.lastTool))
        }
        parts.push('to', label(this.nextTool))
        return parts.join(' ')
    }

    get lastTool() {
        return this.mmu?.last_tool ?? TOOL_GATE_UNKNOWN
    }

    get nextTool() {
        return this.mmu?.next_tool ?? TOOL_GATE_UNKNOWN
    }

    get statusText() {
        if (['complete', 'error', 'cancelled', 'started'].includes(this.mmuPrintState)) {
            return capitalize(this.mmuPrintState)
        }

        if ([ACTION_LOADING, ACTION_UNLOADING].includes(this.mmuAction)) {
            return `${this.mmuAction}: ${this.filamentPosition}mm`
        }

        if (this.mmuAction !== ACTION_IDLE) return this.mmuAction

        if (this.mmuPrintState === 'printing') {
            let str = `Printing (${this.numToolchanges}`
            if (this.totalToolchanges > 0) str += `/${this.totalToolchanges}`
            str += ' swaps)'
            return str
        }

        const filament = this.mmu?.filament ?? 'Unknown'

        return filament !== 'Unloaded' ? `Filament: ${this.filamentPosition}mm` : 'Filament: Unloaded'
    }

    get reasonForPause() {
        return this.mmu?.reason_for_pause ?? null
    }

    get filamentPosition() {
        return (this.mmu?.filament_position ?? 0).toFixed(1)
    }

    get fileForTtgMap() {
        if (!this.printerIsPrinting) return null

        return this.$store.state.printer.current_file ?? null
    }

    handleSyncSpoolman() {
        this.doSend('MMU_SPOOLMAN REFRESH=1 QUIET=1')
    }
}
</script>

<style scoped>
.mmu-disabled {
    pointer-events: none !important;
    opacity: 0.5 !important;
}
</style>
