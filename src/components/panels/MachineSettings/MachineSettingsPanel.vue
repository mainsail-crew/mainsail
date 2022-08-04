<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiEngine"
        :title="$t('Panels.MachineSettingsPanel.Headline').toString()"
        :collapsible="true"
        card-class="machine-settings-panel">
        <div>
            <motion-settings></motion-settings>
        </div>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import SubPanel from '@/components/ui/SubPanel.vue'
import MotionSettings from '@/components/panels/MachineSettings/MotionSettings.vue'
import { mdiEngine } from '@mdi/js'

@Component({
    components: {
        Panel,
        SubPanel,
        MotionSettings,
    },
})
export default class MachineSettingsPanel extends Mixins(BaseMixin) {
    mdiEngine = mdiEngine
}
</script>
