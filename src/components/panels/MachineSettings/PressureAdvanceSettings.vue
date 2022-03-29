<template>
    <v-card-text>
        <v-row>
            <v-col v-if="allExtruders.length > 1" class="col-12 col-xl-4">
                <div class="d-flex align-center">
                    <v-btn
                        v-if="selectedExtruder !== activeExtruder"
                        icon
                        plain
                        class="mr-2"
                        @click="resetToActiveExtruder">
                        <v-icon>{{ mdiRestart }}</v-icon>
                    </v-btn>
                    <v-select
                        v-model="selectedExtruder"
                        :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.Extruder').toString()"
                        :items="allExtruders"
                        :value="activeExtruder"
                        hide-details
                        outlined
                        dense></v-select>
                </div>
            </v-col>
            <v-col :class="allExtruders.length > 1 ? 'col-12 col-md-6 col-xl-4' : 'col-12 col-md-6'">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.Advance').toString()"
                    param="ADVANCE"
                    :target="pressureAdvance"
                    :default-value="defaultPressureAdvance"
                    :extruder="selectedExtruder"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :min="0"
                    :max="null"
                    :step="0.001"
                    :dec="3"
                    unit="mm/s"
                    @submit="sendCmd"></number-input>
            </v-col>
            <v-col :class="allExtruders.length > 1 ? 'col-12 col-md-6 col-xl-4' : 'col-12 col-md-6'">
                <number-input
                    :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.SmoothTime').toString()"
                    param="SMOOTH_TIME"
                    :target="smoothTime"
                    :default-value="defaultSmoothTime"
                    :extruder="selectedExtruder"
                    :output-error-msg="true"
                    :has-spinner="true"
                    :spinner-factor="10"
                    :min="0"
                    :max="0.2"
                    :step="0.001"
                    :dec="3"
                    unit="s"
                    @submit="sendCmd"></number-input>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import NumberInput from '@/components/inputs/NumberInput.vue'
import { Debounce } from 'vue-debounce-decorator'
import { mdiRestart } from '@mdi/js'

@Component({
    components: { Panel, NumberInput },
})
export default class PressureAdvanceSettings extends Mixins(BaseMixin) {
    mdiRestart = mdiRestart

    private extruders: string[] = []
    private selectedExtruder = ''

    resetToActiveExtruder(): void {
        this.selectedExtruder = this.$store.state.printer.toolhead?.extruder
    }

    get allExtruders(): string[] {
        Object.keys(this.$store.state.printer).forEach((e) => {
            if (e.startsWith('extruder') && !this.extruders.includes(e)) this.extruders.push(e)
        })
        this.extruders.length === 1 ? this.resetToActiveExtruder() : {}

        return this.extruders
    }

    get activeExtruder(): string {
        this.resetToActiveExtruder()
        return this.$store.state.printer.toolhead?.extruder
    }

    get pressureAdvance(): number {
        return Math.floor((this.$store.state.printer?.[this.selectedExtruder]?.pressure_advance ?? 0) * 1000) / 1000
    }

    get smoothTime(): number {
        return Math.floor((this.$store.state.printer?.[this.selectedExtruder]?.smooth_time ?? 0.04) * 1000) / 1000
    }

    get defaultPressureAdvance(): number {
        return (
            Math.floor(
                (this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]?.pressure_advance ?? 0) * 1000
            ) / 1000
        )
    }

    get defaultSmoothTime(): number {
        return (
            Math.floor(
                (this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]
                    ?.pressure_advance_smooth_time ?? 0.04) * 1000
            ) / 1000
        )
    }

    @Debounce(500)
    sendCmd(params: { name: string; value: number }): void {
        const gcode = `SET_PRESSURE_ADVANCE EXTRUDER=${this.selectedExtruder} ${params.name}=${params.value}`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
