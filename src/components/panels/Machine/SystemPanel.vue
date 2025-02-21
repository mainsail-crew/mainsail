<template>
    <panel
        v-if="klipperReadyForGui"
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
            <template v-for="(mcu, index) of mcus">
                <v-divider v-if="index" :key="`divider_${mcu}`" class="my-2" />
                <system-panel-mcu :key="`mcu_entry_${mcu}`" :name="mcu" />
            </template>
            <v-divider v-if="mcus.length" class="my-2" />
            <system-panel-host />
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
        const objectNames = Object.keys(this.$store.state.printer) ?? []

        return objectNames.filter((name) => name.startsWith('mcu ') || name === 'mcu').sort()
    }

    get hostStats() {
        return this.$store.getters['server/getHostStats'] ?? null
    }
}
</script>
