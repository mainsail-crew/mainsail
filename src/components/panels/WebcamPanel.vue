<style scoped></style>

<template>
    <panel
        v-if="socketIsConnected"
        :icon="mdiWebcam"
        :title="$t('Panels.WebcamPanel.Headline')"
        :collapsible="$route.fullPath !== '/cam'"
        card-class="webcam-panel"
        :margin-bottom="currentPage !== 'page'">
        <template #buttons>
            <v-menu v-if="showSwitch" :offset-y="true">
                <template #activator="{ props }">
                    <v-btn variant="text" rounded="0" v-bind="props">
                        <v-icon v-if="'icon' in currentCam" size="small" class="mr-2">
                            {{ convertWebcamIcon(currentCam.icon) }}
                        </v-icon>
                        <span class="d-none d-md-block">{{ currentCam.name ?? 'unknown' }}</span>
                        <v-icon size="small">{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list density="compact" class="py-0">
                    <v-list-item link @click="currentCamId = 'all'">
                        <template #prepend>
                            <v-icon size="small" class="mt-1 mr-2">{{ mdiViewGrid }}</v-icon>
                        </template>
                        <template #title>{{ $t('Panels.WebcamPanel.All') }}</template>
                    </v-list-item>
                    <v-list-item v-for="webcam of webcams" :key="webcam.name" link @click="currentCamId = webcam.name">
                        <template #prepend>
                            <v-icon size="small" class="mt-1 mr-2">{{ convertWebcamIcon(webcam.icon) }}</v-icon>
                        </template>
                        <template #title v-text="webcam.name" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-card-text v-if="webcams.length" class="px-0 py-0 content d-inline-block">
            <v-row>
                <v-col class="pb-0" style="position: relative">
                    <webcam-wrapper :webcam="currentCam" :page="currentPage" />
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-else>
            <p class="text-center mb-0 text-disabled">{{ $t('Panels.WebcamPanel.NoWebcam') }}</p>
        </v-card-text>
    </panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useWebcam } from '@/composables/useWebcam'
import Panel from '@/components/ui/Panel.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiMenuDown, mdiViewGrid, mdiWebcam } from '@mdi/js'

const props = defineProps<{
    currentPage?: string
}>()

const { socketIsConnected, convertWebcamIcon } = useWebcam()

const { t } = useI18n()

const store = useStore()

const webcams = computed<GuiWebcamStateWebcam[]>(() =>
    store.getters['gui/webcams/getWebcams']
)

const showSwitch = computed(() =>
    webcams.value.length > 1
)

const currentCamId = computed({
    get: () => {
        if (webcams.value.length === 1) return webcams.value[0].name ?? 'all'

        const currentCamId = store.state.gui.view.webcam.currentCam[props.currentPage ?? ''] ?? 'all'
        if (webcams.value.findIndex((webcam: GuiWebcamStateWebcam) => webcam.name === currentCamId) !== -1)
            return currentCamId
        else if (currentCamId !== undefined && webcams.value.length === 1) return webcams.value[0].name ?? ''
        else return 'all'
    },
    set: (newVal: string) => {
        store.dispatch('gui/setCurrentWebcam', { page: props.currentPage, value: newVal })
    }
})

const currentCam = computed<GuiWebcamStateWebcam>(() => {
    const cam = webcams.value.find((cam: GuiWebcamStateWebcam) => cam.name === currentCamId.value)

    return (
        cam ??
        ({
            name: t('Panels.WebcamPanel.All'),
            service: 'grid',
            icon: mdiViewGrid,
        } as GuiWebcamStateWebcam)
    )
})
</script>
