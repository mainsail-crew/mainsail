<template>
    <div>
        <min-settings-panel></min-settings-panel>
        <klippy-state-panel></klippy-state-panel>
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
                    class="mr-3"></v-progress-circular>
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
                        <template #activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">{{ button.icon }}</v-icon>
                        </template>
                        <span>{{ button.text }}</span>
                    </v-tooltip>
                </v-btn>
            </template>
            <status-panel-printstatus-thumbnail></status-panel-printstatus-thumbnail>
            <status-panel-exclude-object
                :show-dialog.sync="boolShowObjects"
                @update:showDialog="updateShowDialog"></status-panel-exclude-object>
            <template v-if="display_message || print_stats_message">
                <v-container>
                    <v-row>
                        <v-col class="py-2">
                            <span class="subtitle-2 d-block px-0 text--disabled">
                                <v-icon class="mr-2" small>{{ mdiMessageProcessingOutline }}</v-icon>
                                {{ print_stats_message ? print_stats_message : display_message }}
                            </span>
                        </v-col>
                        <v-col class="col-auto py-2">
                            <v-icon class="text--disabled cursor-pointer" small @click="clearDisplayMessage">
                                {{ mdiCloseCircle }}
                            </v-icon>
                        </v-col>
                    </v-row>
                </v-container>
                <v-divider class="mt-0 mb-0"></v-divider>
            </template>
            <v-tabs v-model="activeTab" fixed-tabs dark>
                <v-tab v-if="current_filename" href="#status">{{ $t('Panels.StatusPanel.Status') }}</v-tab>
                <v-tab href="#files">{{ $t('Panels.StatusPanel.Files') }}</v-tab>
                <v-tab href="#jobqueue">{{ $t('Panels.StatusPanel.Jobqueue', { count: jobsCount }) }}</v-tab>
            </v-tabs>
            <v-divider class="my-0"></v-divider>
            <v-tabs-items v-model="activeTab" class="_border-radius">
                <v-tab-item v-if="current_filename" value="status">
                    <status-panel-printstatus></status-panel-printstatus>
                </v-tab-item>
                <v-tab-item value="files">
                    <status-panel-gcodefiles></status-panel-gcodefiles>
                </v-tab-item>
                <v-tab-item value="jobqueue">
                    <status-panel-jobqueue></status-panel-jobqueue>
                </v-tab-item>
            </v-tabs-items>
        </panel>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import StatusPanelPrintstatus from '@/components/panels/Status/Printstatus.vue'
import StatusPanelGcodefiles from '@/components/panels/Status/Gcodefiles.vue'
import StatusPanelJobqueue from '@/components/panels/Status/Jobqueue.vue'
import StatusPanelExcludeObject from '@/components/panels/Status/ExcludeObject.vue'
import StatusPanelPrintstatusThumbnail from '@/components/panels/Status/PrintstatusThumbnail.vue'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiBroom,
    mdiInformation,
    mdiPause,
    mdiPlay,
    mdiPrinter,
    mdiSelectionRemove,
    mdiStop,
    mdiMessageProcessingOutline,
    mdiCloseCircle,
} from '@mdi/js'

@Component({
    components: {
        KlippyStatePanel,
        MinSettingsPanel,
        Panel,
        StatusPanelExcludeObject,
        StatusPanelGcodefiles,
        StatusPanelJobqueue,
        StatusPanelPrintstatus,
        StatusPanelPrintstatusThumbnail,
    },
})
export default class StatusPanel extends Mixins(BaseMixin) {
    mdiInformation = mdiInformation
    mdiMessageProcessingOutline = mdiMessageProcessingOutline
    mdiCloseCircle = mdiCloseCircle

    private boolShowObjects = false

    declare $refs: {
        bigThumbnail: any
    }

    private activeTab = 'files'
    private lastFilename = ''

    get jobs() {
        return this.$store.getters['server/jobQueue/getJobs']
    }

    get jobsCount() {
        return this.jobs?.length ?? 0
    }

    get current_filename() {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get current_file() {
        return this.$store.state.printer.current_file ?? {}
    }

    get printPercent() {
        return Math.round(this.$store.getters['printer/getPrintPercent'] * 100)
    }

    get printerStateOutput() {
        if (this.printer_state !== '') {
            const idle_timeout_state = this.$store.state.printer.idle_timeout?.state

            if (this.printer_state === 'standby' && idle_timeout_state === 'Printing') return 'Busy'

            if (this.printer_state !== '' && ['paused', 'printing'].includes(this.printer_state)) {
                return (
                    this.printPercent + '% ' + this.printer_state.charAt(0).toUpperCase() + this.printer_state.slice(1)
                )
            }

            return this.printer_state.charAt(0).toUpperCase() + this.printer_state.slice(1)
        }

        return this.$t('Panels.StatusPanel.Unknown')
    }

    get toolbarButtons() {
        return [
            {
                text: this.$t('Panels.StatusPanel.PausePrint'),
                color: 'warning',
                icon: mdiPause,
                loadingName: 'statusPrintPause',
                status: ['printing'],
                click: this.btnPauseJob,
            },
            {
                text: this.$t('Panels.StatusPanel.ResumePrint'),
                color: 'success',
                icon: mdiPlay,
                loadingName: 'statusPrintResume',
                status: ['paused'],
                click: this.btnResumeJob,
            },
            {
                text: this.$t('Panels.StatusPanel.CancelPrint'),
                color: 'error',
                icon: mdiStop,
                loadingName: 'statusPrintCancel',
                status: this.$store.state.gui.uiSettings.displayCancelPrint ? ['paused', 'printing'] : ['paused'],
                click: this.btnCancelJob,
            },
            {
                text: this.$t('Panels.StatusPanel.ExcludeObject.ExcludeObject'),
                color: 'warning',
                icon: mdiSelectionRemove,
                loadingName: '',
                status: this.printing_objects.length ? ['paused', 'printing'] : [],
                click: this.btnExcludeObject,
            },
            {
                text: this.$t('Panels.StatusPanel.ClearPrintStats'),
                color: 'primary',
                icon: mdiBroom,
                loadingName: 'statusPrintClear',
                status: ['error', 'complete', 'cancelled'],
                click: this.btnClearJob,
            },
            {
                text: this.$t('Panels.StatusPanel.ReprintJob'),
                color: 'primary',
                icon: mdiPrinter,
                loadingName: 'statusPrintReprint',
                status: ['error', 'complete', 'cancelled'],
                click: this.btnReprintJob,
            },
        ]
    }

    get filteredToolbarButtons() {
        return this.toolbarButtons.filter((button) => {
            return button.status.includes(this.printer_state)
        })
    }

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    get display_message() {
        return this.$store.state.printer.display_status?.message ?? ''
    }

    get print_stats_message() {
        return this.$store.state.printer.print_stats?.message ?? ''
    }

    mounted() {
        if (this.current_filename !== '') this.activeTab = 'status'
    }

    @Watch('current_filename')
    current_filenameChanged(newVal: string) {
        if (newVal === '') this.activeTab = 'files'
        else if (this.lastFilename !== newVal) this.activeTab = 'status'

        this.lastFilename = newVal
    }

    clearDisplayMessage() {
        this.$socket.emit('printer.gcode.script', { script: 'M117' })
    }

    updateShowDialog(newVal: boolean) {
        this.boolShowObjects = newVal
    }

    btnPauseJob() {
        this.$socket.emit('printer.print.pause', {}, { loading: 'statusPrintPause' })
    }

    btnResumeJob() {
        this.$socket.emit('printer.print.resume', {}, { loading: 'statusPrintResume' })
    }

    btnExcludeObject() {
        this.boolShowObjects = true
    }

    btnCancelJob() {
        this.$socket.emit('printer.print.cancel', {}, { loading: 'statusPrintCancel' })
    }

    btnClearJob() {
        this.$socket.emit('printer.gcode.script', { script: 'SDCARD_RESET_FILE' }, { loading: 'statusPrintClear' })
    }

    btnReprintJob() {
        this.$socket.emit('printer.print.start', { filename: this.current_filename }, { loading: 'statusPrintReprint' })
    }
}
</script>

<style lang="scss" scoped>
._border-radius {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
}
</style>
