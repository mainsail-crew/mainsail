<template>
    <v-card-text>
        <v-row>
            <v-col class="col-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Velocity')"
                    :target="current_velocity"
                    :max="max_velocity"
                    :default-value="max_velocity"
                    unit="mm/s"
                    attribute-name="VELOCITY"
                ></motion-settings-input>
            </v-col>
            <v-col class="col-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.SquareCornerVelocity')"
                    :target="current_square_corner_velocity"
                    :max="max_square_corner_velocity"
                    :default-value="max_square_corner_velocity"
                    unit="mm/s"
                    attribute-name="SQUARE_CORNER_VELOCITY"
                ></motion-settings-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Acceleration')"
                    :target="current_accel"
                    :max="max_accel"
                    :default-value="max_accel"
                    unit="mm/s²"
                    attribute-name="ACCEL"
                ></motion-settings-input>
            </v-col>
            <v-col class="col-6">
                <motion-settings-input
                    :label="$t('Panels.MachineSettingsPanel.MotionSettings.Deceleration')"
                    :target="current_accel_to_decel"
                    :max="max_accel_to_decel"
                    :default-value="max_accel_to_decel"
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
    
    get current_velocity() {
        return this.$store.state.printer?.toolhead?.max_velocity ?? 300
    }

    get current_accel() {
        return this.$store.state.printer?.toolhead?.max_accel ?? 3000
    }

    get current_accel_to_decel() {
        return this.$store.state.printer?.toolhead?.max_accel_to_decel ?? 1500
    }

    get current_square_corner_velocity() {
        return this.$store.state.printer?.toolhead?.square_corner_velocity ?? 8
    }
    
    get max_velocity() {
        return this.$store.state.printer?.configfile?.settings?.printer?.max_velocity ?? 300
    }

    get max_accel() {
        return this.$store.state.printer?.configfile?.settings?.printer?.max_accel ?? 3000
    }

    get max_accel_to_decel() {
        return this.$store.state.printer?.configfile?.settings?.printer?.max_accel_to_decel ?? 1500
    }

    get max_square_corner_velocity() {
        return this.$store.state.printer?.configfile?.settings?.printer?.square_corner_velocity ?? 8
    }
}
</script>
