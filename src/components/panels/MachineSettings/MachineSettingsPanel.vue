<template>
    <panel
        v-if="klipperReadyForGui"
        icon="mdi-engine"
        :title="$t('Panels.MachineSettingsPanel.Headline').toString()"
        :collapsible="true"
        card-class="machine-settings-panel"
    >
        <div>
            <sub-panel
                :title="$t('Panels.MachineSettingsPanel.MotionSettings.Motion').toString()"
                sub-panel-class="motion-settings-subpanel"
            >
                <motion-settings></motion-settings>
            </sub-panel>
            <sub-panel
                :title="$t('Panels.MachineSettingsPanel.PressureAdvanceSettings.PressureAdvance').toString()"
                sub-panel-class="pressure-advance-settings-subpanel"
            >
                <pressure-advance-settings></pressure-advance-settings>
            </sub-panel>
            <sub-panel
                v-if="existsFirmwareRetraction"
                :title="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.FirmwareRetraction').toString()"
                sub-panel-class="firmware-retraction-settings-subpanel"
            >
                <firmware-retraction-settings></firmware-retraction-settings>
            </sub-panel>
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import SubPanel from '@/components/ui/SubPanel.vue'
import MotionSettings from '@/components/panels/MachineSettings/MotionSettings.vue'
import PressureAdvanceSettings from '@/components/panels/MachineSettings/PressureAdvanceSettings.vue'
import FirmwareRetractionSettings from '@/components/panels/MachineSettings/FirmwareRetractionSettings.vue'

@Component({
    components: {
        Panel,
        SubPanel,
        MotionSettings,
        PressureAdvanceSettings,
        FirmwareRetractionSettings
    }
})
export default class MachineSettingsPanel extends Mixins(BaseMixin) {

    get existsFirmwareRetraction() {
        return this.$store.state.printer.configfile?.settings?.firmware_retraction ?? false
    }

}
</script>
