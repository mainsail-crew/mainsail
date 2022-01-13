<style scoped>
    .cursor--pointer {
        cursor: pointer;
    }
</style>

<template v-if="klipperReadyForGui">
    <panel :title="$t('Machine.SystemPanel.SystemLoad')" icon="mdi-memory" card-class="machine-systemload-panel" :collapsible="true">
        <v-card-text class="px-0 py-2">
            <div v-for="(mcu, index) of mcus" v-bind:key="mcu.name">
                <v-divider class="my-2" v-if="index" ></v-divider>
                <system-panel-mcu :mcu="mcu"></system-panel-mcu>
            </div>
            <div v-if="hostStats">
                <v-divider class="my-2" v-if="mcus.length" ></v-divider>
                <system-panel-host></system-panel-host>
            </div>
        </v-card-text>
    </panel>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import SystemPanelHost from '@/components/panels/Machine/SystemPanelHost.vue'
import SystemPanelMcu from '@/components/panels/Machine/SystemPanelMcu.vue'
@Component({
    components: {SystemPanelMcu, SystemPanelHost, Panel}
})
export default class SystemPanel extends Mixins(BaseMixin) {

    get mcus() {
        return this.$store.getters['printer/getMcus'] ?? []
    }

    get hostStats() {
        return this.$store.getters['server/getHostStats'] ?? null
    }
}
</script>