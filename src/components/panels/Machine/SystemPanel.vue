<template>
    <panel
        v-if="showPanel"
        :title="$t('Machine.SystemPanel.SystemLoad')"
        :icon="mdiMemory"
        card-class="machine-systemload-panel"
        :collapsible="true">
        <template #buttons>
            <v-btn text tile class="d-none d-md-flex" @click="dialogDevices = true">
                <v-icon small class="mr-1">{{ mdiUsb }}</v-icon>
                {{ $t('Editor.DeviceDialog') }}
            </v-btn>
        </template>
        <v-card-text class="px-0 py-2">
            <div v-for="(mcu, index) of mcus" :key="mcu.name">
                <v-divider v-if="index" class="my-2" />
                <system-panel-mcu :mcu="mcu" />
            </div>
            <div v-if="hostStats">
                <v-divider v-if="mcus.length" class="my-2" />
                <system-panel-host />
            </div>
        </v-card-text>
        <devices-dialog :show-dialog="dialogDevices" @close="dialogDevices = false" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { mdiCloseThick, mdiMemory, mdiUsb } from '@mdi/js'
import SystemPanelHost from '@/components/panels/Machine/SystemPanelHost.vue'
import SystemPanelMcu from '@/components/panels/Machine/SystemPanelMcu.vue'
@Component({
    components: { SystemPanelMcu, SystemPanelHost, Panel },
})
export default class SystemPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiMemory = mdiMemory
    mdiUsb = mdiUsb

    dialogDevices = false

    get mcus() {
        if (!this.klipperReadyForGui) return []

        const mcus = this.$store.getters['printer/getMcus'] ?? []

        return caseInsensitiveSort(mcus, 'name')
    }

    get hostStats() {
        return this.$store.getters['server/getHostStats'] ?? null
    }

    get showPanel() {
        return this.mcus.length > 0 || this.hostStats
    }
}
</script>

<style scoped>
.cursor--pointer {
    cursor: pointer;
}
</style>
