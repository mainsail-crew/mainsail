<template>
    <v-card-text>
        <v-row>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.RetractLength')"
                    :target="current_retract_length"
                    :default-value="config_retract_length"
                    :step="0.01"
                    unit="mm"
                    attribute-name="RETRACT_LENGTH"
                ></firmware-retraction-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.RetractSpeed')"
                    :target="current_retract_speed"
                    :default-value="config_retract_speed"
                    unit="mm/s"
                    attribute-name="RETRACT_SPEED"
                ></firmware-retraction-settings-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.UnretractExtraLength')"
                    :target="current_unretract_extra_length"
                    :default-value="config_unretract_extra_length"
                    :step="0.01"
                    unit="mm"
                    attribute-name="UNRETRACT_EXTRA_LENGTH"
                ></firmware-retraction-settings-input>
            </v-col>
            <v-col class="col-12 col-md-6">
                <firmware-retraction-settings-input
                    :label="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.UnretractSpeed')"
                    :target="current_unretract_speed"
                    :default-value="config_unretract_speed"
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

    get current_retract_length() {
        return this.$store.state.printer?.firmware_retraction?.retract_length ?? 0
    }

    get current_retract_speed() {
        return this.$store.state.printer?.firmware_retraction?.retract_speed ?? 20
    }

    get current_unretract_extra_length() {
        return this.$store.state.printer?.firmware_retraction?.unretract_extra_length ?? 0
    }

    get current_unretract_speed() {
        return this.$store.state.printer?.firmware_retraction?.unretract_speed ?? 10
    }
    
    get config_retract_length() {
        return this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_length ?? 0
    }

    get config_retract_speed() {
        return this.$store.state.printer?.configfile?.settings?.firmware_retraction?.retract_speed ?? 20
    }

    get config_unretract_extra_length() {
        return this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_extra_length ?? 0
    }

    get config_unretract_speed() {
        return this.$store.state.printer?.configfile?.settings?.firmware_retraction?.unretract_speed ?? 10
    }
}
</script>
