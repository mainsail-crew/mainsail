<template>
    <panel
        v-if="showPanel"
        :title="$t('Machine.SystemPanel.SystemLoad')"
        :icon="mdiMemory"
        card-class="machine-systemload-panel"
        :collapsible="true">
        <template #buttons>
            <v-btn variant="text" tile class="d-none d-md-flex" @click="dialogDevices = true">
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
        <devices-dialog v-model="dialogDevices" />
    </panel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { mdiCloseThick, mdiMemory, mdiUsb } from '@mdi/js'
import SystemPanelHost from '@/components/panels/Machine/SystemPanelHost.vue'
import SystemPanelMcu from '@/components/panels/Machine/SystemPanelMcu.vue'

const { klipperReadyForGui } = useBase()
const store = useStore()

const dialogDevices = ref(false)

const mcus = computed(() => {
    if (!klipperReadyForGui.value) return []
    const mcusList = store.getters['printer/getMcus'] ?? []
    return caseInsensitiveSort(mcusList, 'name')
})

const hostStats = computed(() => store.getters['server/getHostStats'] ?? null)

const showPanel = computed(() => mcus.value.length > 0 || hostStats.value)
</script>

<style scoped>
.cursor--pointer {
    cursor: pointer;
}
</style>
