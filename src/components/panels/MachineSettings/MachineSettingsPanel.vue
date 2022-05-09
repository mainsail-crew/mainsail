<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiEngine"
        :title="$t('Panels.MachineSettingsPanel.Headline').toString()"
        :collapsible="true"
        card-class="machine-settings-panel">
        <div>
            <template v-if="existsFirmwareRetraction">
                <sub-panel
                    :title="$t('Panels.MachineSettingsPanel.MotionSettings.Motion').toString()"
                    sub-panel-class="motion-settings-subpanel"
                    class="py-3">
                    <motion-settings class="pb-0"></motion-settings>
                </sub-panel>
                <sub-panel
                    :title="$t('Panels.MachineSettingsPanel.FirmwareRetractionSettings.FirmwareRetraction').toString()"
                    sub-panel-class="firmware-retraction-settings-subpanel"
                    class="pb-3">
                    <firmware-retraction-settings class="pb-0"></firmware-retraction-settings>
                </sub-panel>
            </template>
            <motion-settings v-else></motion-settings>
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
import { mdiEngine } from '@mdi/js'

@Component({
    components: {
        Panel,
        SubPanel,
        MotionSettings,
        PressureAdvanceSettings,
        FirmwareRetractionSettings,
    },
})
export default class MachineSettingsPanel extends Mixins(BaseMixin) {
    /**
     * Icons
     */
    mdiEngine = mdiEngine

    get existsFirmwareRetraction() {
        return this.$store.state.printer.configfile?.settings?.firmware_retraction ?? false
    }
}
</script>
