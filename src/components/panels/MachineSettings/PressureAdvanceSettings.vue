<template>
    <v-card-text>
        <v-row>
            <v-col v-if="this.all_extruders.length > 1" class="col-12 col-xl-4">
                <div class="d-flex align-center">
                    <v-btn
                        v-if="this.selectedExtruder !== this.current_active_extruder"
                        @click="resetToActiveExtruder"
                        class="mr-2"
                        icon
                        plain
                    ><v-icon>mdi-restart</v-icon>
                    </v-btn>
                    <v-select
                        v-model="selectedExtruder"
                        :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.Extruder')"
                        :items="all_extruders"
                        :value="current_active_extruder"
                        hide-details
                        outlined
                        dense
                    ></v-select>
                </div>
            </v-col>
            <v-col class="col-12 col-md-6" :xl="(this.all_extruders.length > 1) ? 4 : 6">
                <pressure-advance-settings-input
                    :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.Advance')"
                    :target="current_pressure_advance"
                    :step="0.001"
                    :max="1"
                    :default-value="config_pressure_advance"
                    :extruder="selectedExtruder"
                    unit="mm/s"
                    attribute-name="ADVANCE"
                ></pressure-advance-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6" :xl="(this.all_extruders.length > 1) ? 4 : 6">
                <pressure-advance-settings-input
                    :label="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.SmoothTime')"
                    :target="current_smooth_time"
                    :step="0.01"
                    :max="0.2"
                    :default-value="config_smooth_time"
                    :extruder="selectedExtruder"
                    unit="s"
                    attribute-name="SMOOTH_TIME"
                ></pressure-advance-settings-input>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import PressureAdvanceSettingsInput from '@/components/inputs/PressureAdvanceSettingsInput.vue'

@Component({
    components: {Panel, PressureAdvanceSettingsInput}
})
export default class PressureAdvanceSettings extends Mixins(BaseMixin) {
    private extruders: string[] = []
    private selectedExtruder = ''

    resetToActiveExtruder(): void {
        this.selectedExtruder = this.$store.state.printer.toolhead?.extruder
    }

    get all_extruders(): string[] {
        Object.keys(this.$store.state.printer).forEach((e) => {
            (e.match(/^(extruder)\d*$/)) ? this.extruders.push(e) : {}
        })
        this.extruders.length === 1 ? this.resetToActiveExtruder() : {}

        return this.extruders
    }

    get current_active_extruder(): string {
        this.resetToActiveExtruder()
        return this.$store.state.printer.toolhead?.extruder
    }

    get current_pressure_advance(): number {
        return this.$store.state.printer?.[this.selectedExtruder]?.pressure_advance ?? 0
    }

    get current_smooth_time(): number {
        return this.$store.state.printer?.[this.selectedExtruder]?.smooth_time ?? 0.04
    }

    get config_pressure_advance(): number {
        return this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]?.pressure_advance ?? 0
    }

    get config_smooth_time(): number {
        return this.$store.state.printer.configfile?.settings?.[this.selectedExtruder]?.pressure_advance_smooth_time ?? 0.04
    }

}
</script>
