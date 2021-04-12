<style>
    .vertical_align_center {
        margin: auto 0;
    }

    .statusPanel-image-preview {
        width: 100%;
    }

    .v-btn.minwidth-0 {
        min-width: auto !important;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense>
            <v-toolbar-title>
                <span class="subheading align-baseline">
                    <v-progress-circular
                        :rotate="-90"
                        :size="30"
                        :width="5"
                        :value="Math.round(printPercent * 100)"
                        v-if="['paused', 'printing'].includes(printer_state)"
                        color="primary"
                        class="mr-1"
                    >
                    </v-progress-circular>
                    <v-icon
                        v-if="!['paused', 'printing'].includes(printer_state)"
                        left
                    >
                        mdi-information
                    </v-icon>
                    {{ printerStateOutput }}
                </span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group class="v-btn-toggle" name="controllers">
                <template >
                    <v-btn
                        v-for="button in filteredToolbarButtons"
                        v-bind:key="button.loadingName"
                        class="px-2 minwidth-0"
                        :color="button.color"
                        @click="button.click"
                        :loading="loadings.includes(button.loadingName)"
                        small
                    >
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon v-bind="attrs" v-on="on" small>{{ button.icon }}</v-icon>
                            </template>
                            <span>{{ button.text }}</span>
                        </v-tooltip>
                    </v-btn>
                </template>
            </v-item-group>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <template v-if="display_message || print_stats_message">
                <v-container>
                    <v-row>
                        <v-col class="py-2">
                            <span class="subtitle-2 d-block px-0 text--disabled"><v-icon class="mr-2" small>mdi-message-processing-outline</v-icon>{{ print_stats_message ? print_stats_message : display_message }}</span>
                        </v-col>
                    </v-row>
                </v-container>
                <v-divider class="mt-0 mb-0" ></v-divider>
            </template>
            <template v-if="current_filename ">
                <v-container>
                    <v-row>
                        <v-col :class="thumbnailSmall ? 'py-3' : 'py-2'" :style="(thumbnailSmall ? 'width: calc(100% - 40px);' : '')">
                            <span class="subtitle-2 text-truncate d-block px-0 text--disabled"><v-icon small class="mr-2">mdi-file-outline</v-icon>{{ current_filename }}</span>
                        </v-col>
                        <v-col class="pa-2 pl-0 col-auto" v-if="thumbnailSmall">
                            <template v-if="thumbnailSmall && thumbnailBig">
                                <v-tooltip top>
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
                <v-row :class="'text-center '+(!['printing', 'paused', 'error', 'complete'].includes(printer_state) ? 'pt-5 pb-2 mb-0' : 'py-5')" align="center">
                    <v-col class="col-3 pa-0">
                        <strong>{{ $t("Panels.StatusPanel.Position") }}</strong><br />
                        {{ absolute_coordinates ? $t("Panels.StatusPanel.Absolute") : $t("Panels.StatusPanel.Relative") }}
                    </v-col>
                    <v-col class="col-3 pa-0">
                        <strong>{{ $t("Panels.StatusPanel.X") }}</strong><br />
                        {{ position.length ? position[0].toFixed(2) : "--" }}
                    </v-col>
                    <v-col class="col-3 pa-0">
                        <strong>{{ $t("Panels.StatusPanel.Y") }}</strong><br />
                        {{ position.length ? position[1].toFixed(2) : "--" }}
                    </v-col>
                    <v-col class="col-3 pa-0">
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <div v-bind="attrs" v-on="on" class="text-center">
                                    <strong>{{ $t("Panels.StatusPanel.Z") }}</strong><br />
                                    {{ position.length ? position[2].toFixed(2) : "--" }}
                                </div>
                            </template>
                            <span v-if="gcode_position !== undefined && gcode_position.length >= 3">G-Code: {{ gcode_position[2].toFixed(2) }}mm</span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </v-container>
            <template v-if="['printing', 'paused', 'error'].includes(printer_state)">
                <v-divider class="my-0"></v-divider>
                <v-container class="py-0">
                    <v-row class="text-center py-5" align="center">
                        <v-col class="col-3 pa-0">
                            <strong>{{ $t("Panels.StatusPanel.Speed") }}</strong><br />
                            <span class="text-no-wrap">{{ (requested_speed / 60 * speed_factor).toFixed(0) }} mm/s</span>
                        </v-col>
                        <v-col class="col-3 pa-0">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on">
                                        <strong>{{ $t("Panels.StatusPanel.Flow") }}</strong><br />
                                        <span class="d-block text-center text-no-wrap">{{ maxFlow.lastValue ? maxFlow.lastValue.toFixed(1)+" mm&sup3;/s" : "--" }}</span>
                                    </div>
                                </template>
                                <span>{{ $t("Panels.StatusPanel.Max") }}: {{ maxFlow.maxValue ? maxFlow.maxValue.toFixed(1)+" mm&sup3;/s" : "--" }}</span>
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
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import VueLoadImage from "vue-load-image"

    export default {
        components: {
            'vue-load-image': VueLoadImage
        },
        data: function() {
            return {
                maxFlow: {
                    intervalTimer: null,
                    lastExtruderPos: 0,
                    lastTime: 0,
                    lastValue: 0,
                    maxValue: 0,
                }
            }
        },
        computed: {
            ...mapState({
                printer_state: state => state.printer.print_stats.state,
                loadings: state => state.socket.loadings,

                current_filename: state => state.printer.print_stats.filename,
                display_message: state => state.printer.display_status.message,
                print_stats_message: state => state.printer.print_stats.message,

                absolute_coordinates: state => state.printer.gcode_move.absolute_coordinates,
                position: state => state.printer.gcode_move.position,
                gcode_position: state => state.printer.gcode_move.gcode_position,

                requested_speed: state => state.printer.gcode_move.speed,
                speed_factor: state => state.printer.gcode_move.speed_factor,
                filament_used: state => state.printer.print_stats.filament_used,
                current_file: state => state.printer.current_file,
                print_time: state => state.printer.print_stats.print_duration,
                print_time_total: state => state.printer.print_stats.total_duration,
            }),
            printerStateOutput: {
                get() {
                    if (this.$store.state.printer.print_stats.state !== "") {
                        const printer_state = this.$store.state.printer.print_stats.state

                        if (
                            printer_state === "standby" &&
                            this.$store.state.printer.idle_timeout.state === "Printing"
                        ) return "Busy"

                        if (['paused', 'printing'].includes(printer_state)) {
                            return (this.printPercent * 100).toFixed(0)+"% "+printer_state.charAt(0).toUpperCase() + printer_state.slice(1)
                        }

                        return printer_state.charAt(0).toUpperCase() + printer_state.slice(1)
                    }

                    return this.$t("Panels.StatusPanel.Unknown")
                }
            },
            toolbarButtons: {
                get() {
                    return [
                        {
                            text: this.$t("Panels.StatusPanel.PausePrint"),
                            color: "orange",
                            icon: "mdi-pause",
                            loadingName: "statusPrintPause",
                            status: ['printing'],
                            click: this.btnPauseJob
                        }, {
                            text: this.$t("Panels.StatusPanel.ResumePrint"),
                            color: "orange",
                            icon: "mdi-play",
                            loadingName: "statusPrintResume",
                            status: ['paused'],
                            click: this.btnResumeJob
                        }, {
                            text: this.$t("Panels.StatusPanel.CancelPrint"),
                            color: "red",
                            icon: "mdi-stop",
                            loadingName: "statusPrintCancel",
                            status: this.$store.state.gui.general.displayCancelPrint ? ['paused', 'printing'] : ['paused'],
                            click: this.btnCancelJob
                        }, {
                            text: this.$t("Panels.StatusPanel.ClearPrintStats"),
                            color: "primary",
                            icon: "mdi-broom",
                            loadingName: "statusPrintClear",
                            status: ['error', 'complete'],
                            click: this.btnClearJob
                        }, {
                            text: this.$t("Panels.StatusPanel.ReprintJob"),
                            color: "primary",
                            icon: "mdi-printer",
                            loadingName: "statusPrintReprint",
                            status: ['error', 'complete'],
                            click: this.btnReprintJob
                        }
                    ]
                }
            },
            filteredToolbarButtons: {
                get() {
                    return this.toolbarButtons.filter((button) => {
                        return button.status.includes(this.printer_state)
                    })
                }
            },
            printPercent: {
                get() {
                    return this.$store.getters["printer/getPrintPercent"];
                }
            },
            max_layers: {
                get() {
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
            },
            current_layer: {
                get() {
                    if (
                        this.print_time > 0 &&
                        'first_layer_height' in this.current_file &&
                        'layer_height' in this.current_file &&
                        this.gcode_position !== undefined &&
                        this.gcode_position.length >= 3
                    ) {
                        let current_layer = Math.ceil((this.gcode_position[2] - this.current_file.first_layer_height) / this.current_file.layer_height + 1)
                        current_layer = (current_layer <= this.max_layers) ? current_layer : this.max_layers

                        return current_layer > 0 ? current_layer : 0
                    }

                    return 0
                }
            },
            estimated_time_file: {
                get() {
                    return this.$store.getters["printer/getEstimatedTimeFile"]
                }
            },
            estimated_time_filament: {
                get() {
                    return this.$store.getters["printer/getEstimatedTimeFilament"]
                }
            },
            estimated_time_slicer: {
                get() {
                    return this.$store.getters["printer/getEstimatedTimeSlicer"]
                }
            },
            estimated_time_avg: {
                get() {
                    return this.$store.getters["printer/getEstimatedTimeAvg"]
                }
            },
            eta: {
                get() {
                    return this.$store.getters["printer/getEstimatedTimeETA"]
                }
            },
            filament_diameter: {
                get() {
                    return this.$store.state.printer.configfile.settings.extruder?.filament_diameter || 1.75
                }
            },
            basicUrl: {
                get() {
                    return this.$store.getters["socket/getUrl"]
                }
            },
            thumbnailSmall: {
                get() {
                    if (
                        "thumbnails" in this.current_file &&
                        this.current_file.thumbnails.length
                    ) {
                        const thumbnail = this.current_file.thumbnails.find(thumb =>
                            thumb.width >= 32 && thumb.width <= 64 &&
                            thumb.height >= 32 && thumb.height <= 64
                        )

                        if (thumbnail && 'relative_path' in thumbnail) {
                            let relative_url = ""
                            if (this.current_file.filename.lastIndexOf("/") !== -1) {
                                relative_url = this.current_file.filename.substr(0, this.current_file.filename.lastIndexOf("/")+1)
                            }

                            if (thumbnail && 'relative_path' in thumbnail) return this.basicUrl+"/server/files/gcodes/"+relative_url+thumbnail.relative_path
                        }
                    }

                    return ""
                }
            },
            thumbnailBig: {
                get() {
                    if (
                        "thumbnails" in this.current_file &&
                        this.current_file.thumbnails.length
                    ) {
                        const thumbnail = this.current_file.thumbnails.find(thumb => thumb.width >= 300 && thumb.width <= 400)

                        if (thumbnail && 'relative_path' in thumbnail) {
                            let relative_url = ""
                            if (this.current_file.filename.lastIndexOf("/") !== -1) {
                                relative_url = this.current_file.filename.substr(0, this.current_file.filename.lastIndexOf("/")+1)
                            }

                            if (thumbnail && 'relative_path' in thumbnail) return this.basicUrl+"/server/files/gcodes/"+relative_url+thumbnail.relative_path
                        }
                    }

                    return ""
                }
            }
        },
        methods: {
            btnPauseJob() {
                this.$store.commit('socket/addLoading', { name: 'statusPrintPause' });
                this.$socket.sendObj('printer.print.pause', { }, 'socket/removeLoading', { name: 'statusPrintPause' });
            },
            btnResumeJob() {
                this.$store.commit('socket/addLoading', { name: 'statusPrintResume' });
                this.$socket.sendObj('printer.print.resume', { }, 'socket/removeLoading', { name: 'statusPrintResume' });
            },
            btnCancelJob() {
                this.$store.commit('socket/addLoading', { name: 'statusPrintCancel' });
                this.$socket.sendObj('printer.print.cancel', { }, 'socket/removeLoading', { name: 'statusPrintCancel' });
            },
            btnClearJob() {
                this.$store.commit('socket/addLoading', {name: 'statusPrintClear'});
                this.$socket.sendObj('printer.gcode.script', {script: 'SDCARD_RESET_FILE'}, 'socket/removeLoading', { name: 'statusPrintClear' });
            },
            btnReprintJob() {
                this.$store.commit('socket/addLoading', {name: 'statusPrintReprint'});
                this.$socket.sendObj('printer.print.start', { filename: this.current_filename }, 'socket/removeLoading', { name: 'statusPrintReprint' });
            },
            formatTime(seconds) {
                let h = Math.floor(seconds / 3600);
                seconds %= 3600;
                let m = ("0" + Math.floor(seconds / 60)).slice(-2);
                let s = ("0" + (seconds % 60).toFixed(0)).slice(-2);

                return h+':'+m+':'+s;
            },
            formatDateTime(msec) {
                const date = new Date(msec)
                const h = date.getHours() >= 10 ? date.getHours() : "0"+date.getHours()
                const m = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()

                const diff = msec - new Date().getTime()
                return h+":"+m+((diff > 60*60*24*1000) ? "+"+parseInt(diff / (60*60*24*1000)) : "")
            },
            calcMaxFlow() {
                const newExtruderPos = parseFloat(this.filament_used)

                if (
                    this.maxFlow.lastExtruderPos &&
                    this.maxFlow.lastExtruderPos < newExtruderPos &&
                    this.maxFlow.lastTime
                ) {
                    const timeDiff = (new Date().getTime() - this.maxFlow.lastTime) / 1000
                    const filamentDiff = newExtruderPos - this.maxFlow.lastExtruderPos
                    const filamentCrossSection = Math.pow(this.filament_diameter / 2, 2) * Math.PI

                    this.maxFlow.lastValue = filamentCrossSection * filamentDiff / timeDiff

                    if (this.maxFlow.maxValue < this.maxFlow.lastValue) this.maxFlow.maxValue = this.maxFlow.lastValue
                }

                this.maxFlow.lastExtruderPos = newExtruderPos
                this.maxFlow.lastTime = new Date().getTime()
            }
        },
        created() {
            this.maxFlow.intervalTimer = setInterval(() => {
                this.calcMaxFlow()
            }, 3000)
        },
        beforeDestroy() {
            if (this.maxFlow.intervalTimer) clearInterval(this.maxFlow.intervalTimer)
        },
        watch: {
            printer_state: {
                handler(newVal) {
                    if (['complete', 'cancel', 'error', 'standby'].includes(newVal)) {
                        this.maxFlow.lastValue = 0
                        this.maxFlow.maxValue = 0
                        this.maxFlow.lastTime = 0
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .equal-width {
        flex-basis: 0;
    }

    .category-header {
        flex: 0 0 100px;
    }
    a:not(:hover) {
        color: inherit;
    }

    .content span,
    .content strong {
        padding-left: 8px;
        padding-right: 8px;
        white-space: pre-wrap;
    }

    .probe-span {
        border-radius: 5px;
    }
    .probe-span:not(:last-child) {
        margin-right: 8px;
    }
</style>
