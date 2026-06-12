<template>
    <div>
        <v-app-bar app elevate-on-scroll :height="topbarHeight" class="topbar pa-0" clipped-left>
            <v-app-bar-nav-icon rounded="0" @click.stop="naviDrawer = !naviDrawer" />
            <router-link to="/">
                <inline-svg v-if="sidebarLogo && isSvgLogo" :src="sidebarLogo" :class="logoClasses" />
                <img v-else-if="sidebarLogo" :src="sidebarLogo" :class="logoClasses" alt="Logo" />
                <mainsail-logo v-else :color="logoColor" :class="logoClasses" router to="/" :ripple="false" />
            </router-link>
            <v-toolbar-title class="text-no-wrap ml-0 pl-2 mr-2">{{ printerName }}</v-toolbar-title>
            <printer-selector v-if="countPrinters" />
            <div v-if="klipperReadyForGui" class="topbar-dro mx-3">
                <span
                    v-for="axis in droAxes"
                    :key="axis.id"
                    class="topbar-dro__axis"
                >
                    <span
                        :class="['topbar-dro__label', axis.homed ? 'topbar-dro__label--homed' : 'topbar-dro__label--unhomed']">
                        {{ axis.id }}
                    </span>
                    <span class="topbar-dro__value">{{ axis.machine }}</span>
                </span>
                <span class="topbar-dro__sep">|</span>
                <span class="topbar-dro__velocity">Vel {{ liveVelocity }}</span>
                <span class="topbar-dro__sep">|</span>
                <span class="topbar-dro__mode">{{ coordinateModeLabel }}</span>
            </div>
            <v-spacer />
            <input
                ref="fileUploadAndStart"
                type="file"
                :accept="gcodeInputFileAccept.join(', ')"
                style="display: none"
                @change="uploadAndStart" />
            <v-btn
                v-if="showSaveConfigButton"
                rounded="0"
                :icon="displaySmAndDown"
                :text="displayMdAndUp"
                color="primary"
                class="button-min-width-auto px-3 d-none d-sm-flex save-config-button"
                :disabled="printerIsPrinting"
                :loading="loadings.includes('topbarSaveConfig')"
                @click="saveConfig">
                <v-icon class="d-md-none">{{ mdiContentSave }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.SAVE_CONFIG') }}</span>
            </v-btn>
            <v-btn
                v-if="boolShowUploadAndPrint"
                rounded="0"
                :icon="displaySmAndDown"
                :text="displayMdAndUp"
                color="primary"
                class="button-min-width-auto px-3 d-none d-sm-flex upload-and-start-button"
                :loading="loadings.includes('btnUploadAndStart')"
                @click="btnUploadAndStart">
                <v-icon class="mr-md-2">{{ mdiFileUpload }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.UploadPrint') }}</span>
            </v-btn>
            <v-btn
                v-if="klippyIsConnected"
                rounded="0"
                :icon="displaySmAndDown"
                :text="displayMdAndUp"
                color="error"
                class="button-min-width-auto px-3 emergency-button"
                :loading="loadings.includes('topbarEmergencyStop')"
                @click="btnEmergencyStop">
                <v-icon class="mr-md-2">{{ mdiAlertOctagonOutline }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.EmergencyStop') }}</span>
            </v-btn>
            <the-notification-menu />
            <the-settings-menu />
            <the-top-corner-menu />
        </v-app-bar>
        <v-snackbar v-model="uploadSnackbar.status" :timeout="-1" fixed right bottom>
            <strong>{{ $t('App.TopBar.Uploading') }} {{ uploadSnackbar.filename }}</strong>
            <br />
            {{ Math.round(uploadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(uploadSnackbar.speed)) }}/s
            <br />
            <v-progress-linear class="mt-2" :value="uploadSnackbar.percent"></v-progress-linear>
            <template #actions="{ props }">
                <v-btn :icon="mdiClose" color="red" variant="text" v-bind="props" style="min-width: auto" @click="cancelUpload" />
            </template>
        </v-snackbar>
        <emergency-stop-dialog v-model="showEmergencyStopDialog" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { getCurrentInstance } from 'vue'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import { useSocket } from '@/composables/useSocket'
import { validGcodeExtensions } from '@/store/variables'
import axios, { CancelTokenSource } from 'axios'
import type { AxiosProgressEvent } from 'axios'
import { formatFilesize } from '@/plugins/helpers'
import TheTopCornerMenu from '@/components/TheTopCornerMenu.vue'
import TheSettingsMenu from '@/components/TheSettingsMenu.vue'
import Panel from '@/components/ui/Panel.vue'
import PrinterSelector from '@/components/ui/PrinterSelector.vue'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import TheNotificationMenu from '@/components/notifications/TheNotificationMenu.vue'
import { topbarHeight } from '@/store/variables'
import { mdiAlertOctagonOutline, mdiContentSave, mdiFileUpload, mdiClose, mdiCloseThick } from '@mdi/js'
import EmergencyStopDialog from '@/components/dialogs/EmergencyStopDialog.vue'
import InlineSvg from 'vue-inline-svg'

type uploadSnackbar = {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    cancelTokenSource: CancelTokenSource | null
}

const store = useStore()
const { t } = useI18n()
const router = useRouter()
const display = useDisplay()
const displaySmAndDown = computed(() => display.smAndDown.value)
const displayMdAndUp = computed(() => display.mdAndUp.value)
const { proxy } = getCurrentInstance()!
const { klipperReadyForGui, klippyIsConnected, printer_state, printerIsPrinting, loadings, isIOS,
    apiUrl, existGcodesRootDirectory } = useBase()
const { sidebarLogo } = useTheme()
const logoColor = computed(() => store.state.gui.uiSettings.logo)
const socket = useSocket()

const fileUploadAndStart = ref<HTMLInputElement | null>(null)
const showEmergencyStopDialog = ref(false)

const uploadSnackbar = ref<uploadSnackbar>({
    status: false,
    filename: '',
    percent: 0,
    speed: 0,
    total: 0,
    cancelTokenSource: null,
})

const gcodeInputFileAccept = computed(() => {
    if (isIOS.value) return []
    return validGcodeExtensions
})

const naviDrawer = computed({
    get: () => store.state.naviDrawer,
    set: (newVal) => store.dispatch('setNaviDrawer', newVal),
})

const currentPage = computed(() => router.currentRoute.value.fullPath)

const saveConfigPending = computed(() => store.state.printer.configfile?.save_config_pending ?? false)
const hideSaveConfigForBedMash = computed(() => store.state.gui.uiSettings.hideSaveConfigForBedMash ?? false)

const showSaveConfigButton = computed(() => {
    if (!klipperReadyForGui.value) return false
    if (!hideSaveConfigForBedMash.value) return saveConfigPending.value

    let pendingKeys = Object.keys(store.state.printer.configfile?.save_config_pending_items ?? {})
    pendingKeys = pendingKeys.filter((key: string) => !key.startsWith('bed_mesh '))
    return pendingKeys.length > 0
})

const printerName = computed((): string => {
    if (store.state.gui.general.printername.length) return store.state.gui.general.printername
    return store.state.printer.hostname
})

const machinePosition = computed(() => {
    const p = store.state.printer?.motion_report?.live_position ?? [0, 0, 0, 0]
    return { x: p[0] ?? 0, y: p[1] ?? 0, z: p[2] ?? 0 }
})

const homedAxes = computed((): string => store.state.printer?.toolhead?.homed_axes ?? '')

const xAxisHomed = computed((): boolean => homedAxes.value.includes('x'))
const yAxisHomed = computed((): boolean => homedAxes.value.includes('y'))
const zAxisHomed = computed((): boolean => homedAxes.value.includes('z'))

const liveVelocity = computed(() => {
    const v = store.state.printer?.motion_report?.live_velocity ?? 0
    return `${Number(v).toFixed(1)} mm/s`
})

const coordinateModeLabel = computed(() => {
    const abs = store.state.printer?.gcode_move?.absolute_coordinates ?? true
    return abs ? 'G90' : 'G91'
})

function formatAxis(value: number, digits: number) {
    return Number(value ?? 0).toFixed(digits)
}

const droAxes = computed(() => [
    { id: 'X', homed: xAxisHomed.value, machine: formatAxis(machinePosition.value.x, 2) },
    { id: 'Y', homed: yAxisHomed.value, machine: formatAxis(machinePosition.value.y, 2) },
    { id: 'Z', homed: zAxisHomed.value, machine: formatAxis(machinePosition.value.z, 3) },
])

const boolHideUploadAndPrintButton = computed(() =>
    store.state.gui.uiSettings.boolHideUploadAndPrintButton ?? false
)

const isSvgLogo = computed(() =>
    sidebarLogo.value.includes('.svg?timestamp=') || sidebarLogo.value.endsWith('.svg')
)

const logoClasses = computed(() => ['nav-logo', 'ml-2', 'mr-1', 'd-none', 'd-sm-flex'])

const boolShowUploadAndPrint = computed(() =>
    klippyIsConnected.value &&
    existGcodesRootDirectory.value &&
    ['standby', 'complete', 'cancelled'].includes(printer_state.value) &&
    !boolHideUploadAndPrintButton.value
)

const countPrinters = computed(() => store.getters['farm/countPrinters'])

const defaultNavigationStateSetting = computed(() =>
    store.state.gui?.uiSettings?.defaultNavigationStateSetting ?? 'alwaysOpen'
)

onMounted(() => {
    switch (defaultNavigationStateSetting.value) {
        case 'alwaysClosed':
            naviDrawer.value = false
            break
        case 'lastState':
            naviDrawer.value = (localStorage.getItem('naviDrawer') ?? 'true') === 'true'
            break
        default:
            naviDrawer.value = display.lgAndUp.value
    }
})

function btnEmergencyStop() {
    const confirmOnEmergencyStop = store.state.gui.uiSettings.confirmOnEmergencyStop
    if (confirmOnEmergencyStop) {
        showEmergencyStopDialog.value = true
        return
    }
    emergencyStop()
}

function saveConfig() {
    store.dispatch('server/addEvent', { message: 'SAVE_CONFIG', type: 'command' })
    socket.emit('printer.gcode.script', { script: 'SAVE_CONFIG' }, { loading: 'topbarSaveConfig' })
}

function btnUploadAndStart() {
    fileUploadAndStart.value?.click()
}

async function uploadAndStart() {
    if (!fileUploadAndStart.value?.files?.length) return

    await store.dispatch('socket/addLoading', { name: 'btnUploadAndStart' })
    const successFiles = []
    for (const file of fileUploadAndStart.value.files) {
        const result = await doUploadAndStart(file)
        successFiles.push(result)
    }

    await store.dispatch('socket/removeLoading', { name: 'btnUploadAndStart' })
    for (const file of successFiles) {
        const text = t('App.TopBar.UploadOfFileSuccessful', { file: file }).toString()
        proxy!.$toast.success(text)
    }

    fileUploadAndStart.value.value = ''
    if (currentPage.value !== '/') await router.push('/')
}

function doUploadAndStart(file: File) {
    const formData = new FormData()
    const filename = file.name

    uploadSnackbar.value.filename = filename
    uploadSnackbar.value.status = true
    uploadSnackbar.value.percent = 0
    uploadSnackbar.value.speed = 0

    formData.append('file', file, filename)
    formData.append('print', 'true')

    return new Promise((resolve) => {
        uploadSnackbar.value.cancelTokenSource = axios.CancelToken.source()
        axios
            .post(apiUrl.value + '/server/files/upload', formData, {
                cancelToken: uploadSnackbar.value.cancelTokenSource.token,
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    uploadSnackbar.value.percent = (progressEvent.progress ?? 0) * 100
                    uploadSnackbar.value.speed = progressEvent.rate ?? 0
                    uploadSnackbar.value.total = progressEvent.total ?? 0
                },
            })
            .then((result) => {
                uploadSnackbar.value.status = false
                resolve(result.data.result)
            })
            .catch(() => {
                uploadSnackbar.value.status = false
                store.dispatch('socket/removeLoading', { name: 'btnUploadAndStart' })
                const text = t('App.TopBar.CannotUploadTheFile').toString()
                proxy!.$toast.error(text)
            })
    })
}

function cancelUpload(): void {
    uploadSnackbar.value.cancelTokenSource?.cancel()
    uploadSnackbar.value.status = false
}

function emergencyStop() {
    showEmergencyStopDialog.value = false
    socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
:deep(.topbar) .v-toolbar__content {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

.topbar-dro {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.topbar-dro__axis {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
}

.topbar-dro__label {
    font-weight: 700;
}

.topbar-dro__label--homed {
    color: rgb(var(--v-theme-primary));
}

.topbar-dro__label--unhomed {
    color: rgb(var(--v-theme-primary));
    opacity: 0.9;
}

.topbar-dro__sep {
    color: rgba(255, 255, 255, 0.42);
    margin: 0 0.1rem;
}

.topbar-dro__velocity {
    color: rgba(255, 255, 255, 0.72);
}

.topbar-dro__mode {
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.72rem;
}

.button-min-width-auto {
    min-width: auto !important;
}
/*noinspection CssUnusedSymbol*/
.topbar .v-btn {
    height: 100% !important;
    max-height: none;
}
:deep(.topbar) .nav-logo {
    width: auto;
    height: 32px;
}
/*noinspection CssUnusedSymbol*/
.topbar .v-btn.v-btn--icon {
    /*noinspection CssUnresolvedCustomProperty*/
    width: var(--topbar-icon-btn-width) !important;
}
/*noinspection CssUnusedSymbol*/
@media (min-width: 768px) {
    header.topbar {
        z-index: 8 !important;
    }
}
</style>
