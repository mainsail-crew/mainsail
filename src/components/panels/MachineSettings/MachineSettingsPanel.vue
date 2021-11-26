<template>
    <panel
        v-if="klipperReadyForGui"
        icon="mdi-engine"
        :title="$t('Panels.MachineSettingsPanel.Headline')"
        :collapsible="true"
        card-class="machine-settings-panel"
    >
        <motion-settings></motion-settings>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import MotionSettings from '@/components/panels/MachineSettings/MotionSettings.vue'

@Component({
    components: {Panel, MotionSettings}
})
export default class MachineSettingsPanel extends Mixins(BaseMixin) {

}
</script>
