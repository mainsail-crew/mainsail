<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiThermometerLines"
        :title="$t('Panels.TemperaturePanel.Headline')"
        :collapsible="true"
        card-class="temperature-panel">
        <template #buttons>
            <temperature-panel-presets />
            <temperature-panel-settings />
        </template>
        <v-card-text class="pa-0">
            <temperature-panel-list />
            <template v-if="boolTempchart">
                <v-divider class="my-0" />
                <temp-chart />
            </template>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import { capitalize, convertName } from '@/plugins/helpers'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import TempChart from '@/components/charts/TempChart.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiThermometerLines } from '@mdi/js'
import TemperaturePanelPresets from '@/components/panels/Temperature/TemperaturePanelPresets.vue'

@Component({
    components: { Panel, TempChart, TemperaturePanelPresets },
})
export default class TemperaturePanel extends Mixins(BaseMixin, ControlMixin) {
    mdiCloseThick = mdiCloseThick
    mdiThermometerLines = mdiThermometerLines

    convertName = convertName
    capitalize = capitalize

    get boolTempchart(): boolean {
        return this.$store.state.gui.view.tempchart.boolTempchart ?? false
    }
}
</script>
