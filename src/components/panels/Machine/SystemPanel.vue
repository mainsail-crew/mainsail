<style scoped>
.cursor--pointer {
    cursor: pointer;
}
</style>

<template v-if="klipperReadyForGui">
    <panel
        :title="$t('Machine.SystemPanel.SystemLoad')"
        :icon="mdiMemory"
        card-class="machine-systemload-panel"
        :collapsible="true">
        <v-card-text class="px-0 py-2">
            <div v-for="(mcu, index) of mcus" :key="mcu.name">
                <v-divider v-if="index" class="my-2"></v-divider>
                <system-panel-mcu :mcu="mcu"></system-panel-mcu>
            </div>
            <div v-if="hostStats">
                <v-divider v-if="mcus.length" class="my-2"></v-divider>
                <system-panel-host></system-panel-host>
            </div>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { mdiCloseThick, mdiMemory } from '@mdi/js'
import SystemPanelHost from '@/components/panels/Machine/SystemPanelHost.vue'
import SystemPanelMcu from '@/components/panels/Machine/SystemPanelMcu.vue'
@Component({
    components: { SystemPanelMcu, SystemPanelHost, Panel },
})
export default class SystemPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiMemory = mdiMemory

    get mcus() {
        const mcus = this.$store.getters['printer/getMcus'] ?? []

        return caseInsensitiveSort(mcus, 'name')
    }

    get hostStats() {
        return this.$store.getters['server/getHostStats'] ?? null
    }
}
</script>
