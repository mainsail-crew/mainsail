<template>
    <v-dialog v-model="showDialog" width="600" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.MmuPanel.RecoverState')"
            :icon="mdiCogRefresh"
            card-class="mmu-recover-state-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-card-text>
                <p>{{ $t('Panels.MmuPanel.MmuRecoverDialog.Intro') }}</p>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Panels.MmuPanel.MmuRecoverDialog.Tool')"
                    :sub-title="$t('Panels.MmuPanel.MmuRecoverDialog.ToolDescription')">
                    <v-select
                        v-model="localTool"
                        :items="toolsList"
                        :error-messages="toolErrorMessage"
                        outlined
                        :hide-details="toolErrorMessage.length === 0"
                        dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Panels.MmuPanel.MmuRecoverDialog.Gate')"
                    :sub-title="$t('Panels.MmuPanel.MmuRecoverDialog.GateDescription')">
                    <v-select
                        v-model="localGate"
                        :items="gatesList"
                        :error-messages="gateErrorMessage"
                        outlined
                        :hide-details="gateErrorMessage.length === 0"
                        dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Panels.MmuPanel.MmuRecoverDialog.FilamentPosition')"
                    :sub-title="$t('Panels.MmuPanel.MmuRecoverDialog.FilamentPositionDescription')">
                    <v-select
                        v-model="localFilamentPos"
                        :items="posList"
                        :error-messages="posErrorMessage"
                        outlined
                        :hide-details="posErrorMessage.length === 0"
                        dense />
                </settings-row>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" :disabled="okDisabled" text @click="commit">
                    {{ $t('Panels.MmuPanel.Ok') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, VModel, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    FILAMENT_POS_LOADED,
    FILAMENT_POS_UNKNOWN,
    FILAMENT_POS_UNLOADED,
    GATE_UNKNOWN,
    TOOL_GATE_BYPASS,
    TOOL_GATE_UNKNOWN,
} from '@/components/mixins/mmu'
import { mdiCloseThick, mdiCogRefresh } from '@mdi/js'

@Component
export default class MmuRecoverStateDialog extends Mixins(BaseMixin, MmuMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCogRefresh = mdiCogRefresh

    @VModel({ type: Boolean }) showDialog!: boolean

    localGate = GATE_UNKNOWN
    localTool = TOOL_GATE_UNKNOWN
    localFilamentPos = FILAMENT_POS_UNKNOWN

    get toolsList() {
        const tools = []

        for (let i = 0; i < this.mmuNumGates; i++) {
            tools.push({ text: `T${i}`, value: i })
        }

        if (this.mmuHasBypass) {
            tools.push({ text: this.$t('Panels.MmuPanel.Bypass').toString(), value: TOOL_GATE_BYPASS })
        }

        return tools
    }

    get toolErrorMessage() {
        const messages = []

        if (this.localTool === TOOL_GATE_UNKNOWN) {
            messages.push(this.$t('Panels.MmuPanel.MmuRecoverDialog.NoTool').toString())
        }

        if (this.localGate === TOOL_GATE_BYPASS && this.localTool !== TOOL_GATE_BYPASS) {
            messages.push(this.$t('Panels.MmuPanel.MmuRecoverDialog.GateBypass').toString())
        }

        return messages
    }

    get gatesList() {
        const list = []

        for (let gate = 0; gate < this.mmuNumGates; gate++) {
            list.push({ text: this.gateIndexText(gate), value: gate })
        }

        if (this.mmuHasBypass) {
            list.push({ text: this.$t('Panels.MmuPanel.Bypass'), value: TOOL_GATE_BYPASS })
        }

        return list
    }

    get gateErrorMessage() {
        const messages = []

        if (this.localGate === TOOL_GATE_UNKNOWN) {
            messages.push(this.$t('Panels.MmuPanel.MmuRecoverDialog.NoGate').toString())
        }

        if (this.localTool === TOOL_GATE_BYPASS && this.localGate !== TOOL_GATE_BYPASS) {
            messages.push(this.$t('Panels.MmuPanel.MmuRecoverDialog.ToolBypass').toString())
        }

        if (this.localGate >= 0 && this.ttgMap[this.localGate] !== this.localTool) {
            const msg = this.$t('Panels.MmuPanel.MmuRecoverDialog.Remap', { tool: `T${this.localTool}` }).toString()
            messages.push(`${this.$t('Panels.MmuPanel.MmuRecoverDialog.WarningPrefix').toString()} ${msg}`)
        }

        return messages
    }

    get posList() {
        return [
            { text: this.$t('Panels.MmuPanel.MmuRecoverDialog.Unknown').toString(), value: FILAMENT_POS_UNKNOWN },
            { text: this.$t('Panels.MmuPanel.MmuRecoverDialog.Unloaded').toString(), value: FILAMENT_POS_UNLOADED },
            { text: this.$t('Panels.MmuPanel.MmuRecoverDialog.Loaded').toString(), value: FILAMENT_POS_LOADED },
        ]
    }

    get posErrorMessage(): string {
        if (this.localFilamentPos === FILAMENT_POS_UNKNOWN) {
            return `${this.$t('Panels.MmuPanel.MmuRecoverDialog.WarningPrefix').toString()} ${this.$t('Panels.MmuPanel.MmuRecoverDialog.NoPosition').toString()}`
        }
        return ''
    }

    get okDisabled() {
        const warningPrefix = this.$t('Panels.MmuPanel.MmuRecoverDialog.WarningPrefix').toString()
        const messages = [...this.toolErrorMessage, ...this.gateErrorMessage, ...this.posErrorMessage]

        return messages.filter((msg) => !msg.startsWith(warningPrefix)).length > 0
    }

    get numUnits(): number {
        return this.$store.state.printer?.mmu_machine?.num_units ?? 1
    }

    gateIndexText(gateIndex: number) {
        if (this.mmuNumUnits <= 1) return `${gateIndex}`

        for (let i = 0; i < this.mmuNumUnits; i++) {
            const unit = this.getMmuMachineUnit(i)
            if (!unit) continue

            if (i > 0 && gateIndex >= unit.first_gate && gateIndex < unit.first_gate + unit.num_gates) {
                return `${gateIndex} (unit #${i + 1})`
            }
        }

        return `${gateIndex}`
    }

    close() {
        this.showDialog = false
    }

    commit() {
        const cmdParts = ['MMU_RECOVER']

        cmdParts.push(`TOOL=${this.localTool}`)
        cmdParts.push(`GATE=${this.localGate}`)

        if ([FILAMENT_POS_UNLOADED, FILAMENT_POS_LOADED].includes(this.localFilamentPos)) {
            cmdParts.push(`LOADED=${this.localFilamentPos === FILAMENT_POS_LOADED ? 1 : 0}`)
        }

        this.doSend(cmdParts.join(' '))
        this.close()
    }

    @Watch('showDialog', { immediate: true })
    onShowDialogChanged(newValue: boolean): void {
        if (!newValue) return

        this.localGate = this.mmuGate
        this.localTool = this.mmuTool
        this.localFilamentPos = this.mmuFilamentPos

        if (![FILAMENT_POS_UNLOADED, FILAMENT_POS_LOADED].includes(this.localFilamentPos)) {
            this.localFilamentPos = FILAMENT_POS_UNKNOWN
        }
    }
}
</script>
