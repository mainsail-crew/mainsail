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
                    <v-icon left>mdi-information</v-icon>{{ (printer_state !== "" ? printer_state.charAt(0).toUpperCase() + printer_state.slice(1) : $t("Panels.StatusPanel.Unknown")) }}
                </span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group class="v-btn-toggle" name="controllers">
                <v-btn small class="px-2 minwidth-0" color="orange" v-if="printer_state === 'printing'" @click="btnPauseJob" :loading="loadings.includes('statusPrintPause')">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on" small>mdi-pause</v-icon>
                        </template>
                        <span>{{ $t("Panels.StatusPanel.PausePrint") }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn small class="px-2 minwidth-0" color="orange" v-if="(printer_state === 'paused')" :loading="loadings.includes('statusPrintResume')" @click="btnResumeJob">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on" small>mdi-play</v-icon>
                        </template>
                        <span>{{ $t("Panels.StatusPanel.ResumePrint") }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn small class="px-2 minwidth-0" color="red" v-if="(printer_state === 'paused' || (displayCancelPrint && printer_state === 'printing'))" :loading="loadings.includes('statusPrintCancel')" @click="btnCancelJob">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on" small>mdi-stop</v-icon>
                        </template>
                        <span>{{ $t("Panels.StatusPanel.CancelPrint") }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn small class="px-2 minwidth-0" color="primary" v-if="['error', 'complete'].includes(printer_state)" :loading="loadings.includes('statusPrintClear')" @click="btnClearJob">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on" small>mdi-broom</v-icon>
                        </template>
                        <span>{{ $t("Panels.StatusPanel.ClearPrintStats") }}</span>
                    </v-tooltip>
                </v-btn>
                <v-btn small class="px-2 minwidth-0" color="primary" v-if="['error', 'complete'].includes(printer_state)" :loading="loadings.includes('statusPrintReprint')" @click="btnReprintJob">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on" small>mdi-printer</v-icon>
                        </template>
                        <span>{{ $t("Panels.StatusPanel.ReprintJob") }}</span>
                    </v-tooltip>
                </v-btn>
            </v-item-group>
        </v-toolbar>
        <v-container v-if="current_filename ">
            <v-row>
                <v-col class="col-auto pr-0 py-2">
                    <v-progress-circular
                        :rotate="-90"
                        :size="50"
                        :width="7"
                        :value="Math.round(printPercent * 100)"
                        color="red"
                    >
                    </v-progress-circular>
                </v-col>
                <v-col class="col py-2" style="width: 100px;">
                    <h3 class="font-weight-regular">{{ Math.round(printPercent * 100)+"%" }}{{ printer_state !== "error" ? (display_message ? " - "+display_message : "") : print_stats_message }}</h3>
                    <span class="subtitle-2 text-truncate d-block px-0 text--disabled"><v-icon small class="mr-1">mdi-file-outline</v-icon>{{ current_filename }}</span>
                </v-col>
            </v-row>
        </v-container>
        <v-divider v-if="current_filename " class="mt-0 mb-0" ></v-divider>
        <v-card-text class="px-0 py-0 content">
            <v-container>
                <v-row>
                    <v-col
                        class="col-12 col-sm-4 pl-sm-0 pt-0 pr-sm-0 pb-0"
                        v-if="
                            ['printing', 'paused', 'complete'].includes(printer_state) &&
                            current_file &&
                            current_file.thumbnails &&
                            current_file.thumbnails.length &&
                            current_file.thumbnails.find(element => element.width >= 300 && element.width <= 400)
                        ">
                        <img
                            class="statusPanel-image-preview"
                            :src="'data:image/gif;base64,'+(current_file.thumbnails ? current_file.thumbnails.find(element => element.width >= 300 && element.width <= 400).data : '')"
                        />
                    </v-col>
                    <v-col
                        :class="
                            (['printing', 'paused', 'complete'].includes(printer_state) &&
                            current_file &&
                            current_file.thumbnails &&
                            current_file.thumbnails.length &&
                            current_file.thumbnails.find(element => element.width >= 300 && element.width <= 400))  ? 'col-12 col-sm-8' : 'col-12'
                        ">
                        <v-row class="text-center py-4" align="center">
                            <v-col class="flex-grow-0 py-0">
                                <v-icon>mdi-axis-arrow</v-icon>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.X") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ position.length ? position[0].toFixed(2) : "--" }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Y") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ position.length ? position[1].toFixed(2) : "--" }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Z") }}</strong></v-col></v-row>
                                <v-row>
                                    <v-col class="pa-0">

                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <span v-bind="attrs" v-on="on">{{ position.length ? position[2].toFixed(2) : "--" }}</span>
                                            </template>
                                            <span v-if="gcode_position !== undefined && gcode_position.length >= 3">G-Code: {{ gcode_position[2].toFixed(2) }}mm</span>
                                        </v-tooltip>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state) ">
                            <v-col class="pa-0">
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-row class="text-center py-4" align="center" v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state) ">
                            <v-col class="flex-grow-0 py-0">
                                <v-icon>mdi-poll</v-icon>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Filament") }}</strong></v-col></v-row>
                                <v-row>
                                    <v-col class="pa-0">
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <span v-bind="attrs" v-on="on" v-if="filament_used >= 1000" class=" text-no-wrap">{{ (filament_used / 1000).toFixed(2) }} m</span>
                                                <span v-bind="attrs" v-on="on" v-if="filament_used < 1000" class=" text-no-wrap">{{ filament_used.toFixed(2) }} mm</span>
                                            </template>
                                            <span v-if="'filament_total' in current_file">{{ (filament_used / 1000).toFixed(2) }} / {{ (current_file.filament_total / 1000).toFixed(2) }}m = {{ ( 100 / current_file.filament_total * filament_used).toFixed(0) }}% </span>
                                        </v-tooltip>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Print") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ formatTime(print_time) }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Total") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ formatTime(print_time_total) }}</v-col></v-row>
                            </v-col>
                        </v-row>
                        <v-row v-if="['printing', 'paused', 'error'].includes(printer_state) ">
                            <v-col class="pa-0">
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-row class="text-center py-4" align="center" v-if="['printing', 'paused', 'error'].includes(printer_state)">
                            <v-col class="flex-grow-0 py-0">
                                <v-icon>mdi-printer-3d</v-icon>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Speed") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0 text-no-wrap">{{ (requested_speed / 60 * speed_factor).toFixed(0) }} mm/s</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Layer") }}</strong></v-col></v-row>
                                <v-row>
                                    <v-col class="pa-0 text-no-wrap">
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <span v-bind="attrs" v-on="on">{{ current_layer }} of {{ max_layers }}</span>
                                            </template>
                                            <span v-if="'object_height' in current_file && current_file.object_height > 0">{{ $t("Panels.StatusPanel.ObjectHeight") }} {{ current_file.object_height }}mm</span>
                                        </v-tooltip>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.ETA") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ eta ? formatDateTime(eta) : '--' }}</v-col></v-row>
                            </v-col>
                        </v-row>
                        <v-row v-if="['printing', 'paused', 'error'].includes(printer_state) ">
                            <v-col class="pa-0">
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-row class="text-center py-4" align="center" v-if="['printing', 'paused', 'error'].includes(printer_state) ">
                            <v-col class="flex-grow-0 py-0">
                                <v-icon>mdi-clock-outline</v-icon>
                            </v-col>
                            <v-col class="equal-width py-0 ">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.File") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ estimated_time_file ? formatTime(estimated_time_file) : '--' }}</v-col></v-row>

                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Filament") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ estimated_time_filament ? formatTime(estimated_time_filament) : '--' }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-0">
                                <v-row><v-col class="pa-0"><strong>{{ $t("Panels.StatusPanel.Slicer") }}</strong></v-col></v-row>
                                <v-row><v-col class="pa-0">{{ estimated_time_slicer ? formatTime(estimated_time_slicer) : '--' }}</v-col></v-row>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                toolhead: state => state.printer.toolhead,
                position: state => state.printer.toolhead.position,
                gcode_position: state => state.printer.gcode_move.gcode_position,
                requested_speed: state => state.printer.gcode_move.speed,
                speed_factor: state => state.printer.gcode_move.speed_factor,

                printProgress: state => state.printer.virtual_sdcard.progress,
                file_position: state => state.printer.virtual_sdcard.file_position,
                current_file: state => state.printer.current_file,

                print_time: state => state.printer.print_stats.print_duration,
                print_time_total: state => state.printer.print_stats.total_duration,
                filament_used: state => state.printer.print_stats.filament_used,
                current_filename: state => state.printer.print_stats.filename,
                printer_state: state => state.printer.print_stats.state,
                print_stats_message: state => state.printer.print_stats.message,

                display_message: state => state.printer.display_status.message,
                loadings: state => state.socket.loadings,

                displayCancelPrint: state => state.gui.general.displayCancelPrint,
            }),
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
            eta: {
                get() {
                    return this.$store.getters["printer/getEstimatedTimeETA"]
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

                return h+":"+m
            },
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
