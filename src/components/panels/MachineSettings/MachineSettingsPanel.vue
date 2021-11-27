<template>
    <panel
        v-if="klipperReadyForGui"
        icon="mdi-engine"
        :title="$t('Panels.MachineSettingsPanel.Headline')"
        :collapsible="true"
        card-class="machine-settings-panel"
    >
        <motion-settings v-if="!existsFirmwareRetraction"></motion-settings>

        <div v-if="existsFirmwareRetraction">
            <sub-panel
                :title="$t('Panels.MachineSettingsPanel.MotionSettings.Motion')"
                sub-panel-class="motion-settings-subpanel"
            >
                <motion-settings></motion-settings>
            </sub-panel>
            <sub-panel
                :title="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.FirmwareRetraction')"
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
import FirmwareRetractionSettings from '@/components/panels/MachineSettings/FirmwareRetractionSettings.vue'

@Component({
    components: {
        Panel,
        SubPanel,
        MotionSettings,
        FirmwareRetractionSettings
    }
})
export default class MachineSettingsPanel extends Mixins(BaseMixin) {

    get existsFirmwareRetraction() {
        return this.$store.state.printer.configfile?.settings?.firmware_retraction ?? false
    }

}
</script>
