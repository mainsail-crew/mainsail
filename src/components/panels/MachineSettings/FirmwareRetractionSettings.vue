<template>
    <v-card-text>
        <v-row>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.RetractLength').toString()"
                    :target="current_retract_length"
                    :default-value="config_retract_length"
                    :hasSpinner="true"
                    :spinnerFactor="10"
                    :step="0.01"
                    :min="0"
                    :max="null"
                    :dec="2"
                    unit="mm"
                    attribute-name="RETRACT_LENGTH"
                ></firmware-retraction-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.RetractSpeed').toString()"
                    :target="current_retract_speed"
                    :default-value="config_retract_speed"
                    :hasSpinner="true"
                    :spinnerFactor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"
                    attribute-name="RETRACT_SPEED"
                ></firmware-retraction-settings-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.UnretractExtraLength').toString()"
                    :target="current_unretract_extra_length"
                    :default-value="config_unretract_extra_length"
                    :hasSpinner="true"
                    :spinnerFactor="10"
                    :step="0.01"
                    :min="0"
                    :max="null"
                    :dec="2"
                    unit="mm"
                    attribute-name="UNRETRACT_EXTRA_LENGTH"
                ></firmware-retraction-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.UnretractSpeed').toString()"
                    :target="current_unretract_speed"
                    :default-value="config_unretract_speed"
                    :hasSpinner="true"
                    :spinnerFactor="5"
                    :step="1"
                    :min="1"
                    :max="null"
                    :dec="0"
                    unit="mm/s"
                    attribute-name="UNRETRACT_SPEED"
                ></firmware-retraction-settings-input>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import FirmwareRetractionSettingsInput from '@/components/inputs/FirmwareRetractionSettingsInput.vue'

@Component({
    components: {Panel, FirmwareRetractionSettingsInput}
})
export default class FirmwareRetractionSettings extends Mixins(BaseMixin) {

    get current_retract_length(): number {
        return Math.floor((this.$store.state.printer?.firmware_retraction?.retract_length ?? 0) * 100) / 100
    }

    get current_retract_speed(): number {
        return Math.trunc(this.$store.state.printer?.firmware_retraction?.retract_speed ?? 20)
    }

    get current_unretract_extra_length(): number {
        return Math.floor((this.$store.state.printer?.firmware_retraction?.unretract_extra_length ?? 0) * 100) / 100
    }

    get current_unretract_speed(): number {
        return Math.trunc(this.$store.state.printer?.firmware_retraction?.unretract_speed ?? 10)
    }
    
    get config_retract_length(): number {
        return Math.floor((this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_length ?? 0) * 100) / 100
    }

    get config_retract_speed(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_speed ?? 20)
    }

    get config_unretract_extra_length(): number {
        return Math.floor((this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_extra_length ?? 0) * 100) / 100
    }

    get config_unretract_speed(): number {
        return Math.trunc(this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_speed ?? 0)
    }
}
</script>
