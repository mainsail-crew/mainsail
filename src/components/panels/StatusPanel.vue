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
                    <v-icon left>mdi-information</v-icon>{{ (printer_state !== "" ? printer_state.charAt(0).toUpperCase() + printer_state.slice(1) : "Unknown") }}
                </span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-item-group class="v-btn-toggle" name="controllers">
                <v-btn small class="px-2 minwidth-0" color="orange" v-if="printer_state === 'printing'" @click="btnPauseJob" :loading="loadings.includes('statusPrintPause')" title="Pause print"><v-icon small>mdi-pause</v-icon></v-btn>
                <v-btn small class="px-2 minwidth-0" color="red" v-if="(printer_state === 'paused')" :loading="loadings.includes('statusPrintCancel')" @click="btnCancelJob" title="Cancel print"><v-icon small>mdi-stop</v-icon></v-btn>
                <v-btn small class="px-2 minwidth-0" color="orange" v-if="(printer_state === 'paused')" :loading="loadings.includes('statusPrintResume')" @click="btnResumeJob" title="Resume job"><v-icon small>mdi-play</v-icon></v-btn>
                <v-btn small class="px-2 minwidth-0" color="orange" v-if="['error', 'complete'].includes(printer_state)" :loading="loadings.includes('statusPrintClear')" @click="btnClearJob" title="Clear job"><v-icon small>mdi-close</v-icon></v-btn>
                <v-btn small class="px-2 minwidth-0" color="primary" v-if="['error', 'complete'].includes(printer_state)" :loading="loadings.includes('statusPrintReprint')" @click="btnReprintJob" title="Reprint job"><v-icon small>mdi-autorenew</v-icon></v-btn>
            </v-item-group>
        </v-toolbar>
        <v-container v-if="current_filename ">
            <v-row>
                <v-col class="col-auto pr-0 py-2">
                    <v-progress-circular
                        :rotate="-90"
                        :size="50"
                        :width="7"
                        :value="printPercent * 100"
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
                            current_file.thumbnails.find(element => element.width === 400)

                        ">
                        <img
                            class="statusPanel-image-preview"
                            :src="'data:image/gif;base64,'+(current_file.thumbnails ? current_file.thumbnails.find(element => element.width === 400).data : '')"
                        />
                    </v-col>
                    <v-col
                        :class="
                            (['printing', 'paused', 'complete'].includes(printer_state) &&
                            current_file &&
                            current_file.thumbnails &&
                            current_file.thumbnails.length &&
                            current_file.thumbnails.find(element => element.width === 400 || element.width === 300))  ? 'col-12 col-sm-8 pl-sm-0' : 'col-12'
                        ">
                        <v-row class="text-center" align="center">
                            <v-col class="flex-grow-0 pl-8 py-2">
                                <v-icon>mdi-axis-arrow</v-icon>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>X</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ position.length ? position[0].toFixed(2) : "--" }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Y</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ position.length ? position[1].toFixed(2) : "--" }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Z</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ position.length ? position[2].toFixed(2) : "--" }}</v-col></v-row>
                            </v-col>
                        </v-row>
                        <v-row v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state) ">
                            <v-col class="px-0">
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-row class="text-center" align="center" v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state) ">
                            <v-col class="flex-grow-0 pl-8 py-2">
                                <v-icon>mdi-poll</v-icon>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Filament</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ filament_used > 1000 ? (filament_used / 1000).toFixed(2)+"m" : filament_used.toFixed(2)+"mm" }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Print</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ formatTime(print_time) }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Total</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ formatTime(print_time_total) }}</v-col></v-row>
                            </v-col>
                        </v-row>
                        <v-row v-if="['printing', 'paused', 'error'].includes(printer_state) ">
                            <v-col class="px-0">
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-row class="text-center" align="center" v-if="['printing', 'paused', 'error'].includes(printer_state) ">
                            <v-col class="flex-grow-0 pl-8 py-2">
                                <v-icon>mdi-clock-outline</v-icon>
                            </v-col>
                            <v-col class="equal-width py-2 ">
                                <v-row><v-col class="px-0 pb-1"><strong>File</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ print_time > 0 && printPercent > 0 ? formatTime(print_time / printPercent - print_time) : '--' }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Filament</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ (filament_used > 0 && 'filament_total' in current_file && current_file.filament_total > filament_used) ? formatTime(print_time / (filament_used / current_file.filament_total) - print_time) : '--' }}</v-col></v-row>
                            </v-col>
                            <v-col class="equal-width py-2">
                                <v-row><v-col class="px-0 pb-1"><strong>Slicer</strong></v-col></v-row>
                                <v-row><v-col class="px-0 pt-1">{{ 'estimated_time' in current_file && current_file.estimated_time > print_time ? formatTime(current_file.estimated_time - print_time) : '--'}}</v-col></v-row>
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
            }),
            printPercent: {
                get() {
                    return this.$store.getters["printer/getPrintPercent"];
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
