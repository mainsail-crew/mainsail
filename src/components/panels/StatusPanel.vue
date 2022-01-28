<style lang="scss" scoped>
    .statusPanel-big-thumbnail {
        transition: height 0.25s ease-out;
    }
</style>

<template>
    <div>
        <dependencies-panel></dependencies-panel>
        <min-settings-panel></min-settings-panel>
        <moonraker-state-panel></moonraker-state-panel>
        <klippy-state-panel></klippy-state-panel>
        <klipper-warnings-panel></klipper-warnings-panel>
        <panel
            v-if="klipperState === 'ready'"
            icon="mdi-information"
            :title="printerStateOutput"
            :collapsible="true"
            card-class="status-panel"
        >
            <template v-slot:icon>
                <v-progress-circular
                    :rotate="-90"
                    :size="30"
                    :width="5"
                    :value="printPercent"
                    color="primary"
                    class="mr-3"
                    v-if="['paused', 'printing'].includes(printer_state)"
                >
                </v-progress-circular>
            </template>
            <template v-slot:buttons >
                <v-btn
                    v-for="button in filteredToolbarButtons"
                    v-bind:key="button.loadingName"
                    :color="button.color"
                    @click="button.click"
                    :loading="loadings.includes(button.loadingName)"
                    icon
                    tile
                >
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">{{ button.icon }}</v-icon>
                        </template>
                        <span>{{ button.text }}</span>
                    </v-tooltip>
                </v-btn>
            </template>
            <v-card-text class="px-0 py-0 content">
                <template v-if="boolBigThumbnail">
                    <v-img
                        :src="thumbnailBig"
                        tabindex="-1"
                        class="d-flex align-end statusPanel-big-thumbnail"
                        ref="bigThumbnail"
                        height="200"
                        @focus="focusBigThumbnail"
                        @blur="blurBigThumbnail"
                    >
                        <v-card-title class="white--text py-2 px-2" style="background-color: rgba(0,0,0,0.3); backdrop-filter: blur(3px);">
                            <v-row>
                                <v-col style="width: 100px">
                                    <span class="subtitle-2 text-truncate px-0 text--disabled d-block"><v-icon small class="mr-2">mdi-file-outline</v-icon>{{ current_filename }}</span>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-img>
                </template>
                <status-panel-exclude-object
                    :show-dialog.sync="boolShowObjects"
                    @update:showDialog="updateShowDialog"
                ></status-panel-exclude-object>
                <template v-if="display_message || print_stats_message">
                    <v-container>
                        <v-row>
                            <v-col class="py-2">
                                <span class="subtitle-2 d-block px-0 text--disabled"><v-icon class="mr-2" small>mdi-message-processing-outline</v-icon>{{ print_stats_message ? print_stats_message : display_message }}</span>
                            </v-col>
                            <v-col class="col-auto py-2">
                                <v-icon class="text--disabled cursor-pointer" @click="clearDisplayMessage" small>mdi-close-circle</v-icon>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-divider class="mt-0 mb-0" ></v-divider>
                </template>
                <template v-if="current_filename && !boolBigThumbnail">
                    <v-container>
                        <v-row>
                            <v-col :class="thumbnailSmall ? 'py-3' : 'py-2'" :style="(thumbnailSmall ? 'width: calc(100% - 40px);' : '')">
                                <span class="subtitle-2 text-truncate d-block px-0 text--disabled"><v-icon small class="mr-2">mdi-file-outline</v-icon>{{ current_filename }}</span>
                            </v-col>
                            <v-col class="pa-2 pl-0 col-auto" v-if="thumbnailSmall">
                                <template v-if="thumbnailSmall && thumbnailBig">
                                    <v-tooltip top content-class="tooltip__content-opacity1">
                                        <template v-slot:activator="{ on, attrs }">
                                            <vue-load-image class="d-flex">
                                                <img slot="image" :src="thumbnailSmall" width="32" height="32" v-bind="attrs" v-on="on" />
                                                <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                                <v-icon slot="error">mdi-file</v-icon>
                                            </vue-load-image>
                                        </template>
                                        <span><img :src="thumbnailBig" width="250" /></span>
                                    </v-tooltip>
                                </template>
                                <template v-else-if="thumbnailSmall">
                                    <vue-load-image>
                                        <img slot="image" :src="thumbnailSmall" width="32" height="32" />
                                        <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                        <v-icon slot="error">mdi-file</v-icon>
                                    </vue-load-image>
                                </template>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-divider class="mt-0 mb-0" ></v-divider>
                </template>
                <v-container class="py-0">
                    <v-row :class="'text-center '+(!['printing', 'paused', 'error', 'complete', 'cancelled'].includes(printer_state) ? 'pt-5 pb-2 mb-0' : 'py-5')" align="center">
                        <v-col class="col-3 pa-0">
                            <strong>{{ $t("Panels.StatusPanel.Position") }}</strong><br />
                            {{ coordinates }}
                        </v-col>
                        <v-col class="col-3 pa-0">
                            <strong>{{ $t("Panels.StatusPanel.X") }}</strong><br />
                            {{ positions.x }}
                        </v-col>
                        <v-col class="col-3 pa-0">
                            <strong>{{ $t("Panels.StatusPanel.Y") }}</strong><br />
                            {{ positions.y }}
                        </v-col>
                        <v-col class="col-3 pa-0">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on" class="text-center">
                                        <strong>{{ $t("Panels.StatusPanel.Z") }}</strong><br />
                                        {{ positions.z }}
                                    </div>
                                </template>
                                <span>G-Code: {{ positions.gcode_z }}mm</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </v-container>
                <template v-if="['printing', 'paused', 'error', 'cancelled'].includes(printer_state)">
                    <v-divider class="my-0"></v-divider>
                    <v-container class="py-0">
                        <v-row class="text-center py-5" align="center">
                            <v-col class="col-3 pa-0">
                                <template v-if="live_velocity !== null">
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on, attrs }">
                                            <div v-bind="attrs" v-on="on">
                                                <strong>{{ $t("Panels.StatusPanel.Speed") }}</strong><br />
                                                <span class="text-no-wrap">{{ live_velocity }} mm/s</span>
                                            </div>
                                        </template>
                                        <span>{{ $t("Panels.StatusPanel.Requested") }}: {{ requested_speed+" mm/s" }}</span>
                                    </v-tooltip>
                                </template>
                                <template v-else>
                                    <strong>{{ $t("Panels.StatusPanel.Speed") }}</strong><br />
                                    <span class="text-no-wrap">{{ requested_speed }} mm/s</span>
                                </template>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on">
                                            <strong>{{ $t("Panels.StatusPanel.Flow") }}</strong><br />
                                            <span class="d-block text-center text-no-wrap">{{ live_flow+" mm&sup3;/s" }}</span>
                                        </div>
                                    </template>
                                    <span>{{ $t("Panels.StatusPanel.Max") }}: {{ maxFlow ? maxFlow+" mm&sup3;/s" : "--" }}</span>
                                </v-tooltip>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on">
                                            <strong>{{ $t("Panels.StatusPanel.Filament") }}</strong><br />
                                            <span class="d-block text-center text-no-wrap">{{ filament_used >= 1000 ? (filament_used / 1000).toFixed(2)+" m" : filament_used.toFixed(2)+" mm" }}</span>
                                        </div>
                                    </template>
                                    <span v-if="'filament_total' in current_file">{{ (filament_used / 1000).toFixed(2) }} / {{ (current_file.filament_total / 1000).toFixed(2) }} m = {{ ( 100 / current_file.filament_total * filament_used).toFixed(0) }} % </span>
                                </v-tooltip>
                            </v-col>
                            <v-col class="col-3 pa-0 text-center">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <strong>{{ $t("Panels.StatusPanel.Layer") }}</strong><br />
                                            <span class="text-no-wrap">{{ current_layer }} of {{ max_layers }}</span>
                                        </div>
                                    </template>
                                    <span v-if="'object_height' in current_file && current_file.object_height > 0">{{ $t("Panels.StatusPanel.ObjectHeight") }}: {{ current_file.object_height }} mm</span>
                                </v-tooltip>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-divider class="my-0"></v-divider>
                    <v-container class="py-0">
                        <v-row class="text-center pt-5 pb-2 mb-0" align="center">
                            <v-col class="col-3 pa-0">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <strong>{{ $t("Panels.StatusPanel.Estimate") }}</strong><br />
                                            <span class="text-no-wrap">{{ estimated_time_avg ? formatTime(estimated_time_avg) : '--' }}</span>
                                        </div>
                                    </template>
                                    <div class="text-right">
                                        {{ $t("Panels.StatusPanel.File") }}: {{ estimated_time_file ? formatTime(estimated_time_file) : '--' }}<br />
                                        {{ $t("Panels.StatusPanel.Filament") }}: {{ estimated_time_filament ? formatTime(estimated_time_filament) : '--' }}
                                    </div>
                                </v-tooltip>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <strong>{{ $t("Panels.StatusPanel.Slicer") }}</strong><br />
                                <span class="text-no-wrap">{{ estimated_time_slicer ? formatTime(estimated_time_slicer) : '--' }}</span>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <strong>{{ $t("Panels.StatusPanel.Total") }}</strong><br />
                                            <span class="text-no-wrap">{{ print_time_total ? formatTime(print_time_total) : '--' }}</span>
                                        </div>
                                    </template>
                                    <div class="text-right">
                                        {{ $t("Panels.StatusPanel.Print") }}: {{ print_time ? formatTime(print_time) : '--' }}<br />
                                        {{ $t("Panels.StatusPanel.Difference") }}: {{ print_time && print_time_total ? formatTime(print_time_total - print_time) : '--' }}
                                    </div>
                                </v-tooltip>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <strong>{{ $t("Panels.StatusPanel.ETA") }}</strong><br />
                                <span class="text-no-wrap">{{ eta ? formatDateTime(eta) : '--' }}</span>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
                <template v-if="['complete'].includes(printer_state)">
                    <v-divider class="my-0"></v-divider>
                    <v-container class="py-0">
                        <v-row class="text-center pt-5 pb-2 mb-0" align="center">
                            <v-col class="col-3 pa-0">
                                <strong>{{ $t("Panels.StatusPanel.Filament") }}</strong><br />
                                <span class="text-no-wrap">{{ filament_used >= 1000 ? (filament_used / 1000).toFixed(2)+" m" : filament_used.toFixed(2)+" mm" }}</span>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <strong>{{ $t("Panels.StatusPanel.Slicer") }}</strong><br />
                                <span class="text-no-wrap">{{ 'estimated_time' in current_file ? formatTime(current_file.estimated_time) : '--' }}</span>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <strong>{{ $t("Panels.StatusPanel.Print") }}</strong><br />
                                <span class="text-no-wrap">{{ print_time ? formatTime(print_time) : '--' }}</span>
                            </v-col>
                            <v-col class="col-3 pa-0">
                                <strong>{{ $t("Panels.StatusPanel.Total") }}</strong><br />
                                <span class="text-no-wrap">{{ print_time_total ? formatTime(print_time_total) : '--' }}</span>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
            </v-card-text>
        </panel>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import { thumbnailSmallMin, thumbnailSmallMax, thumbnailBigMin } from '@/store/variables'
import BaseMixin from '@/components/mixins/base'
import DependenciesPanel from '@/components/panels/DependenciesPanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MoonrakerStatePanel from '@/components/panels/MoonrakerStatePanel.vue'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import KlipperWarningsPanel from '@/components/panels/KlipperWarningsPanel.vue'
import StatusPanelExcludeObject from '@/components/panels/StatusPanelExcludeObject.vue'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: {
        DependenciesPanel,
        KlipperWarningsPanel,
        KlippyStatePanel,
        MinSettingsPanel,
        MoonrakerStatePanel,
        Panel,
        StatusPanelExcludeObject,
    }
})
export default class StatusPanel extends Mixins(BaseMixin) {
    maxFlow = 0
    boolShowObjects = false

    $refs!: {
        bigThumbnail: any
    }

    get current_filename() {
        return this.$store.state.printer.print_stats?.filename ?? ''
    }

    get display_message() {
        return this.$store.state.printer.display_status?.message ?? ''
    }

    get print_stats_message() {
        return this.$store.state.printer.print_stats?.message ?? ''
    }

    get positions() {
        return this.$store.getters['printer/getPositions']
    }

    get coordinates() {
        return this.positions.coordinates ? this.$t('Panels.StatusPanel.Absolute') : this.$t('Panels.StatusPanel.Relative')
    }

    get filament_used() {
        return this.$store.state.printer.print_stats?.filament_used ?? 0
    }

    get current_file() {
        return this.$store.state.printer.current_file ?? {}
    }

    get print_time() {
        return this.$store.state.printer.print_stats?.print_duration ?? 0
    }

    get print_time_total() {
        return this.$store.state.printer.print_stats?.total_duration ?? 0
    }

    get printPercent() {
        return Math.round(this.$store.getters['printer/getPrintPercent'] * 100)
    }

    get printerStateOutput() {
        if (this.printer_state !== '') {
            const idle_timeout_state = this.$store.state.printer.idle_timeout?.state

            if (
                this.printer_state === 'standby' &&
                idle_timeout_state === 'Printing'
            ) return 'Busy'

            if (this.printer_state !== '' && ['paused', 'printing'].includes(this.printer_state)) {
                return this.printPercent+'% '+this.printer_state.charAt(0).toUpperCase() + this.printer_state.slice(1)
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
                icon: 'mdi-pause',
                loadingName: 'statusPrintPause',
                status: ['printing'],
                click: this.btnPauseJob
            }, {
                text: this.$t('Panels.StatusPanel.ResumePrint'),
                color: 'success',
                icon: 'mdi-play',
                loadingName: 'statusPrintResume',
                status: ['paused'],
                click: this.btnResumeJob
            }, {
                text: this.$t('Panels.StatusPanel.CancelPrint'),
                color: 'error',
                icon: 'mdi-stop',
                loadingName: 'statusPrintCancel',
                status: this.$store.state.gui.uiSettings.displayCancelPrint ? ['paused', 'printing'] : ['paused'],
                click: this.btnCancelJob
            }, {
                text: this.$t('Panels.StatusPanel.ExcludeObject.ExcludeObject'),
                color: 'warning',
                icon: 'mdi-selection-remove',
                loadingName: '',
                status: this.printing_objects.length ? ['paused', 'printing'] : [],
                click: this.btnExcludeObject
            }, {
                text: this.$t('Panels.StatusPanel.ClearPrintStats'),
                color: 'primary',
                icon: 'mdi-broom',
                loadingName: 'statusPrintClear',
                status: ['error', 'complete', 'cancelled'],
                click: this.btnClearJob
            }, {
                text: this.$t('Panels.StatusPanel.ReprintJob'),
                color: 'primary',
                icon: 'mdi-printer',
                loadingName: 'statusPrintReprint',
                status: ['error', 'complete', 'cancelled'],
                click: this.btnReprintJob
            }
        ]
    }

    get filteredToolbarButtons() {
        return this.toolbarButtons.filter((button) => {
            return button.status.includes(this.printer_state)
        })
    }

    get live_velocity() {
        return Math.abs(this.$store.state.printer.motion_report?.live_velocity?.toFixed(0)) ?? null
    }

    get live_extruder_velocity() {
        const live_extruder_velocity = this.$store.state.printer.motion_report?.live_extruder_velocity ?? null
        if (live_extruder_velocity === null) return null

        return live_extruder_velocity > 0 ? live_extruder_velocity : 0
    }

    get live_flow() {
        if (this.live_extruder_velocity === null) return null

        const filamentCrossSection = Math.pow(this.filament_diameter / 2, 2) * Math.PI
        const currentFlow = filamentCrossSection * this.live_extruder_velocity

        return currentFlow?.toFixed(1)
    }

    get requested_speed() {
        const requested_speed = this.$store.state.printer.gcode_move?.speed ?? 0
        const speed_factor = this.$store.state.printer.gcode_move?.speed_factor ?? 0
        const max_velocity = this.$store.state.printer.toolhead?.max_velocity ?? 0

        const speed = requested_speed / 60 * speed_factor
        if (speed > max_velocity) return max_velocity

        return speed.toFixed(0)
    }

    get max_layers() {
        if (
            'first_layer_height' in this.current_file &&
            'layer_height' in this.current_file &&
            'object_height' in this.current_file
        ) {
            const max = Math.ceil((this.current_file.object_height - this.current_file.first_layer_height) / this.current_file.layer_height + 1)
            return max > 0 ? max : 0
        }

        return 0
    }

    get current_layer() {
        if (
            this.print_time > 0 &&
            'first_layer_height' in this.current_file &&
            'layer_height' in this.current_file
        ) {
            let current_layer = Math.ceil((this.positions.gcode_z - this.current_file.first_layer_height) / this.current_file.layer_height + 1)
            current_layer = (current_layer <= this.max_layers) ? current_layer : this.max_layers

            return current_layer > 0 ? current_layer : 0
        }

        return 0
    }

    get estimated_time_file() {
        return this.$store.getters['printer/getEstimatedTimeFile']
    }

    get estimated_time_filament() {
        return this.$store.getters['printer/getEstimatedTimeFilament']
    }

    get estimated_time_slicer() {
        return this.$store.getters['printer/getEstimatedTimeSlicer']
    }

    get estimated_time_avg() {
        return this.$store.getters['printer/getEstimatedTimeAvg']
    }

    get eta() {
        return this.$store.getters['printer/getEstimatedTimeETA']
    }

    get filament_diameter() {
        return this.$store.state.printer.configfile?.settings?.extruder?.filament_diameter ?? 1.75
    }

    get thumbnailSmall() {
        if (
            'thumbnails' in this.current_file &&
            this.current_file.thumbnails.length
        ) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) =>
                thumb.width >= thumbnailSmallMin && thumb.width <= thumbnailSmallMax &&
                thumb.height >= thumbnailSmallMin && thumb.height <= thumbnailSmallMax
            )

            if (thumbnail && 'relative_path' in thumbnail) {
                let relative_url = ''
                if (this.current_file.filename.lastIndexOf('/') !== -1) {
                    relative_url = this.current_file.filename.substr(0, this.current_file.filename.lastIndexOf('/')+1)
                }

                if (thumbnail && 'relative_path' in thumbnail) {
                    return `${this.apiUrl}/server/files/gcodes/${encodeURI(relative_url+thumbnail.relative_path)}?timestamp=${this.current_file.modified}`
                }
            }
        }

        return ''
    }

    get thumbnailBig() {
        if (
            'thumbnails' in this.current_file &&
            this.current_file.thumbnails.length
        ) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'relative_path' in thumbnail) {
                let relative_url = ''
                if (this.current_file.filename.lastIndexOf('/') !== -1) {
                    relative_url = this.current_file.filename.substr(0, this.current_file.filename.lastIndexOf('/')+1)
                }

                if (thumbnail && 'relative_path' in thumbnail) {
                    return `${this.apiUrl}/server/files/gcodes/${encodeURI(relative_url+thumbnail.relative_path)}?timestamp=${this.current_file.modified}`
                }
            }
        }

        return ''
    }

    get thumbnailBigHeight() {
        if (
            'thumbnails' in this.current_file &&
            this.current_file.thumbnails.length
        ) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'height' in thumbnail) {
                return thumbnail.height
            }
        }

        return 200
    }

    get thumbnailBigWidth() {
        if (
            'thumbnails' in this.current_file &&
            this.current_file.thumbnails.length
        ) {
            const thumbnail = this.current_file.thumbnails.find((thumb: any) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'width' in thumbnail) {
                return thumbnail.width
            }
        }

        return 300
    }

    get boolBigThumbnail() {
        const setting = this.$store.state.gui.uiSettings.boolBigThumbnail ?? true

        return this.current_filename && setting && this.thumbnailBig
    }

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    updateShowDialog(newVal: boolean) {
        this.boolShowObjects = newVal
    }

    btnPauseJob() {
        this.$socket.emit('printer.print.pause', { }, { loading: 'statusPrintPause' })
    }

    btnResumeJob() {
        this.$socket.emit('printer.print.resume', { }, { loading: 'statusPrintResume' })
    }

    btnExcludeObject() {
        this.boolShowObjects = true
    }

    btnCancelJob() {
        this.$socket.emit('printer.print.cancel', { }, { loading: 'statusPrintCancel' })
    }

    btnClearJob() {
        this.$socket.emit('printer.gcode.script', {script: 'SDCARD_RESET_FILE'}, { loading: 'statusPrintClear' })
    }

    btnReprintJob() {
        this.$socket.emit('printer.print.start', { filename: this.current_filename }, { loading: 'statusPrintReprint' })
    }

    clearDisplayMessage() {
        this.$socket.emit('printer.gcode.script', {script: 'M117'})
    }

    formatTime(seconds: number) {
        let h = Math.floor(seconds / 3600)
        seconds %= 3600
        let m = ('0' + Math.floor(seconds / 60)).slice(-2)
        let s = ('0' + (seconds % 60).toFixed(0)).slice(-2)

        return h+':'+m+':'+s
    }

    formatDateTime(msec: number) {
        const date = new Date(msec)
        const h = date.getHours() >= 10 ? date.getHours() : '0'+date.getHours()
        const m = date.getMinutes() >= 10 ? date.getMinutes() : '0'+date.getMinutes()

        const diff = msec - new Date().getTime()
        return h+':'+m+((diff > 60*60*24*1000) ? '+'+Math.round(diff / (60*60*24*1000)) : '')
    }

    @Watch('live_flow')
    live_flowChanged(newVal: number) {
        if (newVal && this.maxFlow < newVal) this.maxFlow = newVal
    }

    focusBigThumbnail() {
        if (this.$refs.bigThumbnail) {
            const clientWidth = this.$refs.bigThumbnail.$el.clientWidth
            const thumbnailWidth = this.thumbnailBigWidth
            const factor = clientWidth / thumbnailWidth

            this.$refs.bigThumbnail.$el.style.height = (this.thumbnailBigHeight * factor).toFixed()+'px'
        }
    }

    blurBigThumbnail() {
        if (this.$refs.bigThumbnail) {
            this.$refs.bigThumbnail.$el.style.height = '200px'
        }
    }

    onResize() {
        const isFocused = (document.activeElement === this.$refs.bigThumbnail?.$el)
        if (isFocused) this.focusBigThumbnail()
    }

    created() {
        window.addEventListener('resize', this.onResize)
    }

    destroyed() {
        window.removeEventListener('resize', this.onResize)
    }
}
</script>