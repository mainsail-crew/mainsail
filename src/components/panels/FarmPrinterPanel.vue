<template>
    <panel
        ref="panel"
        :icon="mdiPrinter3d"
        :title="printer_name"
        card-class="farmprinter-panel"
        :class="panelClass"
        :loading="printer.socket.isConnecting"
        :toolbar-color="isCurrentPrinter ? 'primary' : ''">
        <template #buttons>
            <v-menu v-if="showWebcamSwitch" :offset-y="true" title="Webcam">
                <template #activator="{ props }">
                    <v-btn variant="text" v-bind="props">
                        <v-icon size="small">{{ mdiWebcam }}</v-icon>
                        <v-icon size="small">{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-list density="compact" class="py-0">
                    <v-list-item link @click="currentCamName = 'off'">
                        <template #prepend>
                            <v-icon size="small" class="mt-1 mr-2">{{ mdiWebcamOff }}</v-icon>
                        </template>
                        <template #title>{{ $t('Panels.FarmPrinterPanel.WebcamOff') }}</template>
                    </v-list-item>
                    <v-list-item
                        v-for="webcam of printer_webcams"
                        :key="webcam.name"
                        link
                        @click="currentCamName = webcam.name">
                        <template #prepend>
                            <v-icon size="small" class="mt-1 mr-2">{{ convertWebcamIcon(webcam.icon) }}</v-icon>
                        </template>
                        <template #title v-text="webcam.name" />
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-hover>
            <template #default="{ hover }">
                <div>
                    <v-img ref="imageDiv" :height="imageHeight" :src="printer_image" class="d-flex align-end">
                        <div
                            v-if="
                                printer.socket.isConnected &&
                                currentCamName !== 'off' &&
                                currentWebcam &&
                                'service' in currentWebcam
                            "
                            class="webcamContainer">
                            <webcam-wrapper :webcam="currentWebcam" :printer-url="printerUrl" :show-fps="false" />
                        </div>
                        <v-card-title
                            class="text-white py-2"
                            style="background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(3px)">
                            <v-row>
                                <v-col class="v-col-auto pr-0 d-flex align-center" style="width: 58px">
                                    <img
                                        v-if="printer_logo"
                                        :src="printer_logo"
                                        style="width: 100%"
                                        class="my-auto"
                                        alt="Logo" />
                                    <mainsail-logo
                                        v-else
                                        :color="printerLogoColor"
                                        style="width: 100%"
                                        class="my-auto" />
                                </v-col>
                                <v-col class="v-col" style="width: 100px">
                                    <h3 class="font-weight-regular">{{ printer_status }}</h3>
                                    <span
                                        v-if="printer_current_filename !== ''"
                                        class="text-subtitle-2 text-truncate px-0 text-disabled d-block">
                                        <v-icon size="small" class="mr-1">{{ mdiFileOutline }}</v-icon>
                                        {{ printer_current_filename }}
                                    </span>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-img>
                    <v-card-text v-if="printer_preview.length" class="px-0 py-2">
                        <v-container class="py-0">
                            <v-row>
                                <v-col
                                    v-for="object in printer_preview"
                                    :key="object.name"
                                    :class="object.name === 'ETA' ? 'v-col-auto' : 'v-col' + ' px-2'">
                                    <strong class="d-block text-center">{{ object.name }}</strong>
                                    <span class="d-block text-center">{{ object.value }}</span>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-fade-transition>
                        <v-overlay v-if="hover" absolute :z-index="4">
                            <v-btn color="primary" @click="clickPrinter">
                                {{
                                    printer.socket.isConnected
                                        ? $t('Panels.FarmPrinterPanel.SwitchToPrinter')
                                        : $t('Panels.FarmPrinterPanel.ReconnectToPrinter')
                                }}
                            </v-btn>
                        </v-overlay>
                    </v-fade-transition>
                </div>
            </template>
        </v-hover>
    </panel>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useWebcam } from '@/composables/useWebcam'
import { useTheme } from '@/composables/useTheme'
import type { FarmPrinterState } from '@/store/farm/printer/types'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiPrinter3d, mdiWebcam, mdiMenuDown, mdiWebcamOff, mdiFileOutline } from '@mdi/js'
import WebcamWrapper from '@/components/webcams/WebcamWrapper.vue'
import type { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

const props = defineProps<{
    printer: FarmPrinterState
}>()

const { convertWebcamIcon, sidebarBgImage } = useWebcam()

const store = useStore()

const imageHeight = ref(200)
let resizeObserver: ResizeObserver | null = null

const imageDiv = ref<{ $el: HTMLElement } | null>(null)
const panel = ref<{ $el: HTMLElement } | null>(null)

const printerUrl = computed(() => {
    const thisUrl = window.location.href.split('/')
    const protocol = thisUrl[0]

    let url = protocol + '//' + props.printer.socket.hostname
    if (80 !== props.printer.socket.webPort) url += ':' + props.printer.socket.webPort

    return url
})

const isCurrentPrinter = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/isCurrentPrinter']
)

const currentCamName = computed({
    get: () => store.getters['farm/' + props.printer._namespace + '/getSetting']('currentCamName', 'off'),
    set: (newVal: string) => {
        store.dispatch('farm/' + props.printer._namespace + '/setSettings', { currentCamName: newVal })
    }
})

const printer_name = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getPrinterName']
)

const printer_status = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getStatus']
)

const printer_current_filename = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getCurrentFilename']
)

const printer_image = computed(() => {
    if (currentWebcam.value) return sidebarBgImage.value
    return store.getters['farm/' + props.printer._namespace + '/getImage'] ?? sidebarBgImage.value
})

const printer_logo = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getLogo']
)

const printerLogoColor = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getLogoColor']
)

const printer_position = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getPosition']
)

const printer_preview = computed(() =>
    store.getters['farm/' + props.printer._namespace + '/getPrinterPreview']
)

const showWebcamSwitch = computed(() => {
    if (printer_webcams.value.length == 0) return false
    return props.printer.socket.isConnected
})

const printer_webcams = computed<GuiWebcamStateWebcam[]>(() =>
    store.getters['farm/' + props.printer._namespace + '/getPrinterWebcams']
)

const currentWebcam = computed<GuiWebcamStateWebcam | null>(() => {
    const currentCam = printer_webcams.value?.find(
        (webcam: GuiWebcamStateWebcam) => webcam.name === currentCamName.value
    )
    if (currentCam) return currentCam
    return null
})

const panelClass = computed<string[]>(() => {
    const output: string[] = []
    if (!props.printer.socket.isConnected && !props.printer.socket.isConnecting) output.push('disabledPrinter')
    return output
})

function clickPrinter() {
    if (props.printer.socket.isConnected) {
        store.dispatch('changePrinter', { printer: props.printer._namespace })
        return
    }

    store.dispatch('farm/' + props.printer._namespace + '/reconnect')
}

onMounted(() => {
    calcImageHeight()

    resizeObserver = new ResizeObserver(() => handleResize())
    if (panel.value) resizeObserver.observe(panel.value.$el)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})

function calcImageHeight() {
    if (imageDiv.value?.$el?.clientWidth) {
        imageHeight.value = Math.round((imageDiv.value.$el.clientWidth / 3) * 2)
        return
    }

    imageHeight.value = 200
}

function handleResize() {
    nextTick(() => {
        calcImageHeight()
    })
}
</script>

<style scoped>
.v-card.disabledPrinter {
    opacity: 0.6;
    filter: grayscale(70%);
}

.webcamContainer,
.webcamContainer .vue-load-image,
.webcamContainer > div,
.webcamContainer img {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.webcamContainer img {
    height: 100%;
}

.webcamContainer .webcamFpsOutput {
    display: none;
}

.v-overlay {
    top: 48px;
}

:deep(.farmprinter-panel) {
    position: relative;
}
</style>
