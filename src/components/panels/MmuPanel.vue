<template>
    <panel v-if="hasMmu" :icon="mdiMulticast" :title="title" :collapsible="true" card-class="mmu-panel">
        <template #buttons>
            <v-menu left offset-y :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small style="width: 100%" @click="showEditTtgMapDialog = true">
                            {{ $t('Panels.MmuPanel.EditTtgMap') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small style="width: 100%" @click="showEditGateMapDialog = true">
                            {{ $t('Panels.MmuPanel.EditGateMap') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small style="width: 100%" :disabled="!canSend" @click="showRecoverStateDialog = true">
                            {{ $t('Panels.MmuPanel.RecoverState') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn small style="width: 100%" :disabled="!canSend" @click="showMaintenanceDialog = true">
                            {{ $t('Panels.MmuPanel.MmuMaintenance') }}
                        </v-btn>
                    </v-list-item>
                    <v-divider class="my-2" />
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn
                            small
                            style="width: 100%"
                            :loading="loadings.includes('mmu_stats')"
                            @click="doLoadingSend('MMU_STATS SHOWCOUNTS=1', 'mmu_stats')">
                            <v-icon left>{{ mdiNoteText }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonPrintStats') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item
                        :disabled="!enabled || spoolmanSupport === 'off'"
                        :class="{ 'mmu-disabled': !enabled || spoolmanSupport === 'off' }">
                        <v-btn
                            small
                            style="width: 100%"
                            :loading="loadings.includes('mmu_spoolman')"
                            @click="handleSyncSpoolman()">
                            <v-icon left>{{ mdiRefresh }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonSyncSpoolman') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item :disabled="!enabled" :class="{ 'mmu-disabled': !enabled }">
                        <v-btn
                            small
                            style="width: 100%"
                            :disabled="!canSend"
                            :loading="loadings.includes('mmu_check_gates')"
                            @click="doLoadingSend('MMU_CHECK_GATES', 'mmu_check_gates')">
                            <v-icon left>{{ mdiCheckAll }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonCheckAllGates') }}
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-menu>
            <mmu-panel-settings />
        </template>

        <v-card-text>
            <v-row>
                <v-col class="pb-0">
                    <MmuUnit
                        v-for="i in numUnits"
                        :key="i"
                        :selected-gate="mmuGate"
                        :unit-index="i - 1"
                        :show-details="true"
                        @select-gate="selectGate" />
                </v-col>
            </v-row>
        </v-card-text>

        <div :class="{ 'mmu-disabled': !enabled }">
            <v-container fluid>
                <v-row align="start">
                    <v-col :cols="col1Size" class="pt-0 d-flex flex-column align-center justify-center">
                        <div class="text--disabled smaller-font">{{ toolchangeText }}</div>
                        <div class="min-height-text">{{ statusText }}</div>
                        <mmu-filament-status />
                        <template v-if="showClogDetection">
                            <mmu-clog-meter v-if="hasEncoder" width="40%" />
                            <div class="text--disabled">{{ $t('Panels.MmuPanel.ClogDetection') }}</div>
                        </template>
                    </v-col>
                    <v-col :cols="12 - col1Size" class="d-flex flex-column align-center justify-center">
                        <template v-if="showDetails">
                            <v-row class="pb-3 pt-0" style="align-self: flex-start; width: 100%">
                                <v-col class="pa-0">
                                    <mmu-gate-summary :gate-index="mmuGate" />
                                </v-col>
                            </v-row>
                        </template>
                        <v-divider style="width: 100%" />
                        <mmu-controls />
                        <v-divider style="width: 100%" />
                        <template v-if="showTtgMap">
                            <mmu-ttg-map
                                width="75%"
                                :start-y="20"
                                :map="ttgMap"
                                :groups="endlessSpoolGroups"
                                :selected-tool="mmuTool"
                                :selected-gate="mmuGate"
                                @click="showEditTtgMapDialog = true" />
                            <div class="text--disabled">{{ $t('Panels.MmuPanel.ToolMapping') }}</div>
                        </template>
                    </v-col>
                </v-row>
                <v-row>
                    <v-divider />
                </v-row>
                <v-row v-if="reasonForPause">
                    <v-col cols="auto" class="d-flex align-center justify-center">
                        <v-icon class="error--text">{{ mdiInformationOutline }}</v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <div>
                            <div class="text--secondary"><strong>Last Error</strong></div>
                            <div class="text--disabled smaller-font">{{ reasonForPause }}</div>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <mmu-edit-gate-map-dialog v-model="showEditGateMapDialog" />
        <mmu-edit-ttg-map-dialog v-model="showEditTtgMapDialog" />
        <mmu-recover-state-dialog v-model="showRecoverStateDialog" />
        <mmu-maintenance-dialog v-model="showMaintenanceDialog" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
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

    // START new code

    selectGate(gateIndex: number) {
        if (gateIndex === TOOL_GATE_BYPASS) {
            this.doSend('MMU_SELECT BYPASS=1')
            return
        }

        this.doSend(`MMU_SELECT GATE=${gateIndex}`)
    }

    // END new code

    get col1Size(): number {
        if (this.$store.state.gui.view.mmu.largeFilamentStatus) return 6
        return 5
    }

    get title(): string {
        const headline = this.$t('Panels.MmuPanel.Headline') as string
        if (!this.enabled) {
            return `${headline} (disabled)`
        }
        return headline
    }

    get showClogDetection(): boolean {
        return this.hasEncoder && this.$store.state.gui.view.mmu.showClogDetection
    }

    get showTtgMap(): boolean {
        return this.$store.state.gui.view.mmu.showTtgMap
    }

    get showDetails(): boolean {
        return this.$store.state.gui.view.mmu.showDetails
    }

    get statusText(): string {
        if (['complete', 'error', 'cancelled', 'started'].includes(this.mmuPrintState)) {
            return capitalize(this.mmuPrintState)
        }

        if (this.action === 'Idle') {
            if (this.mmuPrintState === 'printing') {
                let str = `Printing (${this.numToolchanges}`
                if (this.slicerToolMap.total_toolchanges) str += `/${this.slicerToolMap.total_toolchanges}`
                str += ' swaps)'
                return str
            }
            return this.filament !== 'Unloaded' ? `Filament: ${this.filamentPosition}mm` : 'Filament: Unloaded'
        }

        if (this.action === 'Loading' || this.action === 'Unloading') {
            return `${this.action}: ${this.filamentPosition}mm`
        }

        return this.action
    }

    handleSyncSpoolman() {
        this.refreshSpoolmanData()
        this.doLoadingSend('MMU_SPOOLMAN REFRESH=1 QUIET=1', 'mmu_spoolman')
    }

    /*mounted() {
            if (this.$store.state.printer.mmu?.spoolman_support ?? 'off' !== 'off') {
                this.refreshSpoolmanData()
            }
        }*/
}
</script>

<style scoped>
.mmu-disabled {
    pointer-events: none !important;
    opacity: 0.5 !important;
}

.smaller-font {
    font-size: 0.8em;
    min-height: 1em;
    line-height: 1em;
}

.min-height-text {
    min-height: 1.1em;
    line-height: 1.1em;
}
</style>
