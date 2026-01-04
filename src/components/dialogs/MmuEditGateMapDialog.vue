<template>
    <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.MmuPanel.EditGateMapTitle')"
            :icon="mdiDatabaseEdit"
            card-class="mmu-edit-ttg-map-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn text tile @click="showResetConfirmationDialog = true">
                    {{ $t('Panels.MmuPanel.GateMapDialog.Reset') }}
                </v-btn>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-card-text>
                <v-card-subtitle class="pt-0 px-1 text--secondary">
                    {{ $t('Panels.MmuPanel.GateMapDialog.SelectGate') }}
                </v-card-subtitle>
                <v-row>
                    <v-col class="pb-0">
                        <mmu-unit
                            v-for="i in mmuNumUnits"
                            :key="i"
                            :selected-gate="selectedGate"
                            :unit-index="i - 1"
                            :hide-bypass="true"
                            :unhighlight-spools="true"
                            @select-gate="selectGate" />
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider />

            <v-card-text class="min-height-420 position-relative">
                <transition name="fade">
                    <div v-if="selectedGate === TOOL_GATE_UNKNOWN" class="overlay-text">
                        {{ $t('Panels.MmuPanel.GateMapDialog.SelectGate') }}
                    </div>
                    <mmu-edit-gate-map-dialog-gate-details v-else :selected-gate="selectedGate" />
                </transition>
            </v-card-text>
        </panel>

        <!-- CONFIRMATION FOR RESET ACTION -->
        <confirmation-dialog
            v-model="showResetConfirmationDialog"
            :title="$t('Panels.MmuPanel.Dialog.AreYouSure')"
            :text="$t('Panels.MmuPanel.GateMapDialog.ResetConfirmation')"
            :action-button-text="$t('Panels.MmuPanel.GateMapDialog.Reset')"
            :cancel-button-text="$t('Panels.MmuPanel.Cancel')"
            @action="executeResetGateMap" />
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_UNKNOWN } from '@/components/mixins/mmu'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { mdiCloseThick, mdiDatabaseEdit } from '@mdi/js'

@Component({
    components: { ConfirmationDialog },
})
export default class MmuEditGateMapDialog extends Mixins(BaseMixin, MmuMixin) {
    TOOL_GATE_UNKNOWN = TOOL_GATE_UNKNOWN

    mdiCloseThick = mdiCloseThick
    mdiDatabaseEdit = mdiDatabaseEdit

    @VModel({ type: Boolean }) showDialog!: boolean

    showResetConfirmationDialog = false
    selectedGate = TOOL_GATE_UNKNOWN

    selectGate(gate: number) {
        this.selectedGate = gate
    }

    handleEscapePress(event: KeyboardEvent) {
        if (event.key === 'Escape' || event.code === 'Escape') {
            this.selectedGate = TOOL_GATE_UNKNOWN
        }
    }

    mounted() {
        document.addEventListener('keydown', this.handleEscapePress)
    }

    beforeDestroy() {
        document.removeEventListener('keydown', this.handleEscapePress)
    }

    executeResetGateMap() {
        this.doSend('MMU_GATE_MAP RESET=1')
        this.showResetConfirmationDialog = false
    }

    close() {
        this.showDialog = false
    }
}
</script>

<style scoped>
.min-height-420 {
    min-height: 420px;
}

.overlay-text {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}
</style>
