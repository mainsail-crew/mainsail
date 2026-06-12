<template>
    <div>
        <min-settings-panel />
        <klippy-state-panel />
        <panel
            v-if="klipperReadyForGui"
            :icon="mdiInformation"
            :title="printerStateOutput"
            :collapsible="true"
            card-class="status-panel">
            <template #icon>
                <v-progress-circular
                    v-if="['paused', 'printing'].includes(printer_state)"
                    :rotate="-90"
                    :size="30"
                    :width="5"
                    :value="printPercent"
                    color="primary"
                    class="mr-3" />
            </template>
            <template #buttons>
                <v-btn
                    v-for="button in filteredToolbarButtons"
                    :key="button.loadingName"
                    :color="button.color"
                    :loading="loadings.includes(button.loadingName)"
                    icon
                    tile
                    @click="button.click">
                    <v-tooltip top>
                        <template #activator="{ props }">
                            <v-icon v-bind="props">{{ button.icon }}</v-icon>
                        </template>
                        <span>{{ button.text }}</span>
                    </v-tooltip>
                </v-btn>
            </template>

            <template v-if="print_stats_message">
                <v-container>
                    <v-row>
                        <v-col class="py-2">
                            <span class="text-subtitle-2 px-0 text-disabled">
                                <v-icon class="mr-2 mt-1 float-left" color="warning" small>
                                    {{ mdiAlertOutline }}
                                </v-icon>
                                {{ print_stats_message }}
                            </span>
                        </v-col>
                    </v-row>
                </v-container>
                <v-divider class="mt-0 mb-0" />
            </template>
            <template v-if="display_message">
                <v-container>
                    <v-row class="flex-nowrap">
                        <v-col class="py-2" style="min-width: 0">
                            <span class="text-subtitle-2 px-0 text-disabled">
                                <v-icon class="mr-2 mt-1 float-left" small>{{ mdiMessageProcessingOutline }}</v-icon>
                                {{ display_message }}
                            </span>
                        </v-col>
                        <v-col class="col-auto py-2">
                            <v-icon class="text-disabled cursor-pointer" small @click="clearDisplayMessage">
                                {{ mdiCloseCircle }}
                            </v-icon>
                        </v-col>
                    </v-row>
                </v-container>
                <v-divider class="mt-0 mb-0" />
            </template>
            <v-tabs v-model="activeTab" fixed-tabs>
                <v-tab v-if="current_filename" value="status">
                    <v-icon>{{ mdiSpeedometer }}</v-icon>
                </v-tab>
                <v-tab v-if="displayFilesTab" value="files">
                    <v-icon>{{ mdiFileDocumentMultipleOutline }}</v-icon>
                </v-tab>
                <v-tab v-if="displayHistoryTab" value="history">
                    <v-icon>{{ mdiHistory }}</v-icon>
                </v-tab>
                <v-tab value="jobqueue">
                    <v-badge :color="jobQueueBadgeColor" :content="jobsCount.toString()" :inline="true">
                        <v-icon color="disabled">{{ mdiTrayFull }}</v-icon>
                    </v-badge>
                </v-tab>
            </v-tabs>
            <v-divider class="my-0" />
            <v-window v-model="activeTab" class="_border-radius">
                <v-window-item v-if="current_filename" value="status">
                    <status-panel-printstatus />
                </v-window-item>
                <v-window-item v-if="displayFilesTab" value="files">
                    <status-panel-gcodefiles />
                </v-window-item>
                <v-window-item v-if="displayHistoryTab" value="history">
                    <status-panel-history />
                </v-window-item>
                <v-window-item value="jobqueue">
                    <status-panel-jobqueue />
                </v-window-item>
            </v-window>
        </panel>
        <confirmation-dialog
            v-model="showCancelJobDialog"
            :icon="mdiStopCircleOutline"
            :title="$t('CancelJobDialog.CancelJob')"
            :text="$t('CancelJobDialog.AreYouSure')"
            :action-button-text="$t('Buttons.Yes')"
            :cancel-button-text="$t('Buttons.No')"
            @action="cancelJob" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useSocket } from '@/composables/useSocket'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import StatusPanelPrintstatus from '@/components/panels/Status/Printstatus.vue'
import StatusPanelGcodefiles from '@/components/panels/Status/Gcodefiles.vue'
import StatusPanelHistory from '@/components/panels/Status/History.vue'
import StatusPanelJobqueue from '@/components/panels/Status/Jobqueue.vue'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiAlertOutline,
    mdiBroom,
    mdiCloseCircle,
    mdiFileDocumentMultipleOutline,
    mdiHistory,
    mdiInformation,
    mdiMessageProcessingOutline,
    mdiPause,
    mdiPlay,
    mdiPrinter,
    mdiSpeedometer,
    mdiStop,
    mdiStopCircleOutline,
    mdiTrayFull,
} from '@mdi/js'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

const { klipperReadyForGui, printer_state, loadings } = useBase()

const store = useStore()
const socket = useSocket()

const showCancelJobDialog = ref(false)
const activeTab = ref('files')
const lastFilename = ref('')

const jobs = computed(() => store.getters['server/jobQueue/getJobs'])

const jobsCount = computed(() => store.getters['server/jobQueue/getJobsCount'])

const jobQueueBadgeColor = computed(() =>
    jobsCount.value > 0 ? 'primary darken-2' : 'grey darken-2'
)

const current_filename = computed(() =>
    store.state.printer.print_stats?.filename ?? ''
)

const current_file = computed(() =>
    store.state.printer.current_file ?? {}
)

const printPercent = computed(() =>
    Math.floor(store.getters['printer/getPrintPercent'] * 100)
)

const printerStateOutput = computed(() => {
    if (printer_state.value !== '') {
        const idle_timeout_state = store.state.printer.idle_timeout?.state

        if (printer_state.value === 'standby' && idle_timeout_state === 'Printing') return 'Busy'

        if (printer_state.value !== '' && ['paused', 'printing'].includes(printer_state.value)) {
            return (
                printPercent.value + '% ' + printer_state.value.charAt(0).toUpperCase() + printer_state.value.slice(1)
            )
        }

        return printer_state.value.charAt(0).toUpperCase() + printer_state.value.slice(1)
    }

    return useI18n().t('Panels.StatusPanel.Unknown')
})

const toolbarButtons = computed(() => [
    {
        text: useI18n().t('Panels.StatusPanel.PausePrint'),
        color: 'warning',
        icon: mdiPause,
        loadingName: 'statusPrintPause',
        status: () => ['printing'].includes(printer_state.value),
        click: btnPauseJob,
    },
    {
        text: useI18n().t('Panels.StatusPanel.ResumePrint'),
        color: 'success',
        icon: mdiPlay,
        loadingName: 'statusPrintResume',
        status: () => ['paused'].includes(printer_state.value),
        click: btnResumeJob,
    },
    {
        text: useI18n().t('Panels.StatusPanel.CancelPrint'),
        color: 'error',
        icon: mdiStop,
        loadingName: 'statusPrintCancel',
        status: () => {
            if (store.state.gui.uiSettings.displayCancelPrint)
                return ['paused', 'printing'].includes(printer_state.value)

            return ['paused'].includes(printer_state.value)
        },
        click: btnCancelJob,
    },
    {
        text: useI18n().t('Panels.StatusPanel.ClearPrintStats'),
        color: 'primary',
        icon: mdiBroom,
        loadingName: 'statusPrintClear',
        status: () => ['error', 'complete', 'cancelled'].includes(printer_state.value),
        click: btnClearJob,
    },
    {
        text: useI18n().t('Panels.StatusPanel.ReprintJob'),
        color: 'primary',
        icon: mdiPrinter,
        loadingName: 'statusPrintReprint',
        status: () => ['error', 'complete', 'cancelled'].includes(printer_state.value),
        click: btnReprintJob,
    },
])

const filteredToolbarButtons = computed(() =>
    toolbarButtons.value.filter((button) => button.status())
)

const display_message = computed(() =>
    store.state.printer.display_status?.message ?? null
)

const print_stats_message = computed(() =>
    store.state.printer.print_stats?.message ?? null
)

const macros = computed(() =>
    store.getters['printer/getMacros'] ?? []
)

const displayFilesTab = computed(() => {
    const count = store.state.gui.uiSettings.dashboardFilesLimit ?? 5
    return count > 0
})

const displayHistoryTab = computed(() => {
    const count = store.state.gui.uiSettings.dashboardHistoryLimit ?? 5
    return count > 0
})

onMounted(() => {
    if (current_filename.value !== '') activeTab.value = 'status'
    if (!displayFilesTab.value) activeTab.value = 'history'
    if (!displayHistoryTab.value) activeTab.value = 'jobqueue'
})

watch(current_filename, (newVal: string) => {
    if (newVal === '') activeTab.value = 'files'
    else if (lastFilename.value !== newVal) activeTab.value = 'status'

    lastFilename.value = newVal
})

function clearDisplayMessage() {
    socket.emit('printer.gcode.script', { script: 'M117' })
}

function btnPauseJob() {
    socket.emit('printer.print.pause', {}, { loading: 'statusPrintPause' })
}

function btnResumeJob() {
    socket.emit('printer.print.resume', {}, { loading: 'statusPrintResume' })
}

function btnCancelJob() {
    const confirmOnCancelJob = store.state.gui.uiSettings.confirmOnCancelJob
    if (confirmOnCancelJob) {
        showCancelJobDialog.value = true
        return
    }

    cancelJob()
}

function cancelJob() {
    socket.emit('printer.print.cancel', {}, { loading: 'statusPrintCancel' })
}

function btnClearJob() {
    socket.emit('printer.gcode.script', { script: 'SDCARD_RESET_FILE' }, { loading: 'statusPrintClear' })
}

function btnReprintJob() {
    socket.emit('printer.print.start', { filename: current_filename.value }, { loading: 'statusPrintReprint' })
}
</script>

<style scoped>
._border-radius {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
}

.theme--dark.v-tabs > .v-tabs-bar .v-tab:not(.v-tab--active) > .v-badge > .v-icon {
    color: rgba(255, 255, 255, 0.6);
}
</style>
