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

            <v-card-subtitle>
            {{ $t('Panels.MmuPanel.MmuRecoverDialog.Intro') }}
            </v-card-subtitle>

            <v-card-text>
                <v-row class="fixed-height">
                    <v-col class="col-1"/>
                    <v-col class="col-5 d-flex justify-center">
                        <v-row class="d-flex flex-row">
                            <v-col class="d-flex justify-center flex-column">
                                <span class="settings-row-title">Tool</span>
                                <span class="settings-row-subtitle">{{ $t('Panels.MmuPanel.MmuRecoverDialog.SetTool') }}</span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col class="col-5 d-flex justify-end align-center">
                        <v-select :items="toolsList"
                                  v-model="selectedTool"
                                  :error-messages="toolErrorMessage"
                                  outlined dense/>
                    </v-col>
                </v-row>
                <v-divider class="my-2"></v-divider>
                <v-row class="fixed-height">
                    <v-col class="col-1"/>
                    <v-col class="col-5 d-flex justify-center">
                        <v-row class="d-flex flex-row">
                            <v-col class="d-flex justify-center flex-column">
                                <span class="settings-row-title">Gate</span>
                                <span class="settings-row-subtitle">{{ $t('Panels.MmuPanel.MmuRecoverDialog.SetGate') }}</span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col class="col-5 d-flex justify-end align-center">
                        <v-select :items="gatesList"
                                  v-model="selectedGate"
                                  :error-messages="gateErrorMessage"
                                  outlined dense/>
                    </v-col>
                </v-row>
                <v-divider class="my-2"></v-divider>
                <v-row class="fixed-height">
                    <v-col class="col-1"/>
                    <v-col class="col-5 d-flex justify-center">
                        <v-row class="d-flex flex-row">
                            <v-col class="d-flex justify-center flex-column">
                                <span class="settings-row-title">Filament Position</span>
                                <span class="settings-row-subtitle">{{ $t('Panels.MmuPanel.MmuRecoverDialog.FilamentLoaded') }}</span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col class="col-5 d-flex justify-end align-center">
                        <v-select :items="posList"
                                  v-model="selectedPos"
                                  :error-messages="posErrorMessage"
                                  outlined dense/>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions>
                <v-spacer/>
                <v-btn text @click="close">{{ $t('Panels.MmuPanel.Cancel') }}</v-btn>
                <v-btn color="primary" :disabled="okDisabled" text @click="commit">
                    {{ $t('Panels.MmuPanel.Ok') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiCogRefresh } from '@mdi/js'

@Component({
    components: { Panel }
})
export default class MmuRecoverDialog extends Mixins(BaseMixin, MmuMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCogRefresh = mdiCogRefresh

    @Prop({ required: true }) readonly showDialog!: boolean;

    private localGate: number = -1
    private localTool: number = -1
    private localFilamentPos: number = -1
                                
    @Watch('showDialog')
    onShowDialogChanged(newValue: boolean): void {
        if (newValue) {
            this.localGate = this.gate
            this.localTool = this.tool
            this.localFilamentPos = this.filamentPos
        }
    }

    get selectedTool(): string {
        if (this.localTool === this.TOOL_GATE_UNKNOWN) {
            return 'Unknown'
        } else if (this.localTool === this.TOOL_GATE_BYPASS) {
            return 'Bypass'
        }
        return `T${this.localTool}`
    }

    set selectedTool(newTool: string): void {
        const index = this.toolsList.findIndex(item => item === newTool);
        if (index == this.numGates) {
            this.localTool = this.TOOL_GATE_BYPASS
        } else {
            this.localTool = index
        }
    }

    get toolsList(): string[] {
        const tools: string[] = []
        for (let i = 0; i < this.numGates; i++) {
            tools.push(`T${i}`)
        }
        if (this.hasBypass) tools.push('Bypass')
        return tools
    }

    get toolErrorMessage(): string {
        if (this.localTool === this.TOOL_GATE_UNKNOWN) {
            return this.$t('Panels.MmuPanel.MmuRecoverDialog.NoTool')
        } else if (this.localGate === this.TOOL_GATE_BYPASS && this.localTool !== this.TOOL_GATE_BYPASS) {
            return this.$t('Panels.MmuPanel.MmuRecoverDialog.GateBypass')
        }
        return ""
    }

    get selectedGate(): string {
        if (this.localGate === this.TOOL_GATE_UNKNOWN) {
            return 'Unknown'
        } else if (this.localGate === this.TOOL_GATE_BYPASS) {
            return 'Bypass'
        }
        return `${this.gateIndexText(this.localGate)}`
    }

    set selectedGate(newGate: string): void {
        const index = this.gatesList.findIndex(item => item === newGate);
        if (index == this.numGates) {
            this.localGate = this.TOOL_GATE_BYPASS
        } else {
            this.localGate = index
        }
    }

    get gatesList(): string[] {
        const gates: string[] = []
        for (let gate = 0; gate < this.numGates; gate++) {
            gates.push(this.gateIndexText(gate))
        }
        if (this.hasBypass) gates.push('Bypass')
        return gates
    }

    get gateErrorMessage(): string {
        if (this.localGate === this.TOOL_GATE_UNKNOWN) {
            return this.$t('Panels.MmuPanel.MmuRecoverDialog.NoGate')
        } else if (this.localTool === this.TOOL_GATE_BYPASS && this.localGate !== this.TOOL_GATE_BYPASS) {
            return this.$t('Panels.MmuPanel.MmuRecoverDialog.ToolBypass')
        } else if (this.localGate >= 0 && this.ttgMap[this.localGate] !== this.localTool) {
            return `Warning: ${this.$t('Panels.MmuPanel.MmuRecoverDialog.RemapWarningPrefix')} T${this.localTool}`
        }
        return ""
    }

    private gateIndexText(gateIndex: number): string {
        const num_units = this.$store.state.printer?.mmu_machine?.num_units
        if (num_units > 1) {
            for (let i = 0; i < num_units; i++) {
                const unitRef = `unit_${i}`;
                const unit = this.$store.state.printer?.mmu_machine?.[unitRef]
                if (i > 0 && gateIndex >= unit.first_gate && gateIndex < unit.first_gate + unit.num_gates) {
                    return `${gateIndex} (unit #${i + 1})`
                }
            }
        }
        return `${gateIndex}`
    }

    get selectedPos(): string {
        if (this.localFilamentPos === this.FILAMENT_POS_UNKNOWN) {
            return 'Unknown'
        } else if (this.localFilamentPos === this.FILAMENT_POS_UNLOADED) {
            return "UNLOADED"
        } else if (this.localFilamentPos === this.FILAMENT_POS_LOADED) {
            return "LOADED"
        }
        return "Auto Recover"
    }

    set selectedPos(newPos: string): void {
        if (newPos === 'Unknown') {
            return this.FILAMENT_POS_UNKNOWN
        } else if (newPos === 'UNLOADED') {
            return this.FILAMENT_POS_UNLOADED
        } else if (newPos === 'LOADED') {
            return this.FILAMENT_POS_LOADED
        } else {
            return null
        }
    }

    get posList(): string[] {
        return ['Auto Recover', 'UNLOADED', 'LOADED']
    }

    get posErrorMessage(): string {
        if (this.localFilamentPos === this.FILAMENT_POS_UNKNOWN) {
            return this.$t('Panels.MmuPanel.MmuRecoverDialog.NoPosition')
        }
        return ""
    }

    get okDisabled(): boolean {
        let tError = (this.toolErrorMessage !== "" && !this.toolErrorMessage.startsWith("Warning:"))
        let gError = (this.gateErrorMessage !== "" && !this.gateErrorMessage.startsWith("Warning:"))
        let pError = (this.posErrorMessage !== "" && !this.posErrorMessage.startsWith("Warning:"))
        return (tError || gError || pError)
    }

    close() {
        this.$emit('close')
    }

    commit() {
        let cmd = `MMU_RECOVER TOOL=${this.localTool} GATE=${this.localGate}`
        if (this.localFilamentPos === this.FILAMENT_POS_UNLOADED) {
            cmd += " LOADED=0"
        } else if (this.localFilamentPos === this.FILAMENT_POS_LOADED) {
            cmd += " LOADED=1"
        }
        this.doSend(cmd)
        this.close()
    }
}
</script>

<style scoped>
.settings-row-title {
    display: block;
    width: 100%;
    font-weight: bold;
}

.settings-row-subtitle {
    display: block;
    font-size: 0.8em;
    line-height: 1.3;
    margin-top: 3px;
}

.fixed-height {
    min-height: 100px;
}
</style>
