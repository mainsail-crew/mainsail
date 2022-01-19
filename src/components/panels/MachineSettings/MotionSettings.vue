<template>
    <v-card-text>
        <v-row>
            <v-col class="col-12 col-md-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Velocity').toString()"
                    :target="current_velocity"
                    :default-value="max_velocity"
                    :hasSpinner="true"
                    :spinnerFactor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"
                    attribute-name="VELOCITY"
                ></motion-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.SquareCornerVelocity').toString()"
                    :target="current_square_corner_velocity"
                    :default-value="max_square_corner_velocity"
                    :hasSpinner="true"
                    :step="0.1"
                    :min="0.1"
                    :max="null"
                    :dec="1"
                    unit="mm/s"
                    attribute-name="SQUARE_CORNER_VELOCITY"
                ></motion-settings-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-12 col-md-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Acceleration').toString()"
                    :target="current_accel"
                    :default-value="max_accel"
                    :hasSpinner="true"
                    :spinnerFactor="100"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s²"
                    attribute-name="ACCEL"
                ></motion-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.MaxAccelToDecel').toString()"
                    :target="current_accel_to_decel"
                    :default-value="max_accel_to_decel"
                    :hasSpinner="true"
                    :spinnerFactor="100"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s²"
                    attribute-name="ACCEL_TO_DECEL"
                ></motion-settings-input>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import MotionSettingsInput from '@/components/inputs/MotionSettingsInput.vue'

@Component({
    components: {Panel, MotionSettingsInput}
})
export default class MotionSettings extends Mixins(BaseMixin) {
    
    get current_velocity(): number {
        return Math.trunc(this.$store.state.printer?.toolhead?.max_velocity ?? 300)
    }

    get current_accel(): number {
        return Math.trunc(this.$store.state.printer?.toolhead?.max_accel ?? 3000)
    }

    get current_accel_to_decel(): number {
        return Math.trunc(this.$store.state.printer?.toolhead?.max_accel_to_decel ?? 1500)
    }

    get current_square_corner_velocity(): number {
        return Math.floor((this.$store.state.printer?.toolhead?.square_corner_velocity ?? 8) * 10) / 10
    }
    
    get max_velocity(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_velocity ?? 300)
    }

    get max_accel(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_accel ?? 3000)
    }

    get max_accel_to_decel(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.printer?.max_accel_to_decel ?? 1500)
    }

    get max_square_corner_velocity(): number {
        return Math.floor((this.$store.state.printer?.configfile?.settings?.printer?.square_corner_velocity ?? 8) * 10) / 10
    }
}
</script>
