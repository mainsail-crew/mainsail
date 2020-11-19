<style>
    .vertical_align_center {
        margin: auto 0;
    }

    .statusPanel-image-preview {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-progress-circular
                :rotate="-90"
                :size="50"
                :width="7"
                :value="printPercent * 100"
                color="red"
                class="mr-5 mt-2"
                v-if="['printing', 'paused', 'error'].includes(printer_state)"
            >
            </v-progress-circular>
            <v-list-item-avatar color="grey" v-if="!['printing', 'paused', 'error'].includes(printer_state)"><v-icon dark>mdi-information-variant</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">{{ ['printing', 'paused', 'error'].includes(printer_state) ? Math.round(printPercent * 100)+"% - " : "" }}{{ display_message ? display_message : (printer_state !== "" ? printer_state.charAt(0).toUpperCase() + printer_state.slice(1) : "Unknown") }}</v-list-item-title>
                <v-list-item-subtitle class="mr-3" v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state)">{{ "File: "+current_filename }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-btn-toggle
                color="primary"
                dense
                multiple
            >
                <v-btn class="button-min-width-auto orange px-2" v-if="printer_state === 'printing'" @click="btnPauseJob" :loading="loadingStatusPause" title="Pause print"><v-icon>mdi-pause</v-icon></v-btn>
                <v-btn class="button-min-width-auto red" v-if="(printer_state === 'paused')" :loading="loadingStatusCancel" @click="btnCancelJob" title="Cancel print"><v-icon>mdi-stop</v-icon></v-btn>
                <v-btn class="button-min-width-auto orange" v-if="(printer_state === 'paused')" :loading="loadingStatusResume" @click="btnResumeJob" title="Resume job"><v-icon>mdi-play</v-icon></v-btn>
                <v-btn class="button-min-width-auto orange" v-if="(printer_state === 'error')" :loading="loadingStatusClear" @click="btnClearJob" title="Clear job"><v-icon>mdi-close</v-icon></v-btn>
                <v-btn class="button-min-width-auto primary" v-if="(printer_state === 'complete')" :loading="loadingStatusReprint" @click="btnReprintJob" title="Reprint job"><v-icon>mdi-autorenew</v-icon></v-btn>
            </v-btn-toggle>
        </v-list-item>
        <v-divider class="mt-0 mb-0" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-row>
                <v-col
                    class="col-12 col-sm-4 pl-sm-3 pt-0 pr-sm-0 pb-0"
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
                        current_file.thumbnails.find(element => element.width === 400 || element.width === 300)) ? 'col-12 py-0 col-sm-8 pl-sm-0' : 'col-12 py-0'
                    ">
                    <v-row class="text-center pt-2" align="center">
                        <v-col class="py-0 flex-grow-0 pl-8 pr-3">
                            <v-icon>mdi-axis-arrow</v-icon>
                        </v-col>
                        <v-col class="equal-width py-0">
                            <v-row><v-col class="px-0 py-0"><strong>X</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ position.length ? position[0].toFixed(2) : "--" }}</v-col></v-row>
                        </v-col>
                        <v-col class="equal-width py-0">
                            <v-row><v-col class="px-0 py-0"><strong>Y</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ position.length ? position[1].toFixed(2) : "--" }}</v-col></v-row>
                        </v-col>
                        <v-col class="equal-width py-0 pr-sm-6">
                            <v-row><v-col class="px-0 py-0"><strong>Z</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ position.length ? position[2].toFixed(2) : "--" }}</v-col></v-row>
                        </v-col>
                    </v-row>
                    <v-divider class="my-2" v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state)"></v-divider>
                    <v-row class="text-center" align="center" v-if="['printing', 'paused', 'complete', 'error'].includes(printer_state)">
                        <v-col class="py-0 flex-grow-0 pl-8 pr-3">
                            <v-icon>mdi-poll</v-icon>
                        </v-col>
                        <v-col class="equal-width py-0">
                            <v-row><v-col class="px-0 py-0"><strong>Filament</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ filament_used > 1000 ? (filament_used / 1000).toFixed(2)+"m" : filament_used.toFixed(2)+"mm" }}</v-col></v-row>
                        </v-col>
                        <v-col class="equal-width py-0">
                            <v-row><v-col class="px-0 py-0"><strong>Print</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ formatTime(print_time) }}</v-col></v-row>
                        </v-col>
                        <v-col class="equal-width py-0 pr-sm-6">
                            <v-row><v-col class="px-0 py-0"><strong>Total</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ formatTime(print_time_total) }}</v-col></v-row>
                        </v-col>
                    </v-row>
                    <v-divider class="my-2" v-if="['printing', 'paused', 'error'].includes(printer_state)"></v-divider>
                    <v-row class="text-center" align="center" v-if="['printing', 'paused', 'error'].includes(printer_state)">
                        <v-col class="py-0 flex-grow-0 pl-8 pr-3">
                            <v-icon>mdi-clock-outline</v-icon>
                        </v-col>
                        <v-col class="equal-width py-0">
                            <v-row><v-col class="px-0 py-0"><strong>File</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ print_time > 0 && printPercent > 0 ? formatTime(print_time / printPercent - print_time) : '--' }}</v-col></v-row>
                        </v-col>
                        <v-col class="equal-width py-0">
                            <v-row><v-col class="px-0 py-0"><strong>Filament</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ (filament_used > 0 && 'filament_total' in current_file && current_file.filament_total > filament_used) ? formatTime(print_time / (filament_used / current_file.filament_total) - print_time) : '--' }}</v-col></v-row>
                        </v-col>
                        <v-col class="equal-width py-0 pr-sm-6">
                            <v-row><v-col class="px-0 py-0"><strong>Slicer</strong></v-col></v-row>
                            <v-row><v-col class="px-0 py-0">{{ 'estimated_time' in current_file && current_file.estimated_time > print_time ? formatTime(current_file.estimated_time - print_time) : '--'}}</v-col></v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        data: function() {
            return {
                loadingStatusCancel: false,
                loadingStatusResume: false,
                loadingStatusPause: false,
                loadingStatusClear: false,
                loadingStatusReprint: false,
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

                display_message: state => state.printer.display_status.message,
            }),
            printPercent: {
                get() {
                    return this.$store.getters["printer/getPrintPercent"];
                }
            }
        },
        methods: {
            btnPauseJob() {
                // TODO loading button
                //this.$store.commit('setLoading', { name: 'statusPrintPause' });
                this.$socket.sendObj('printer.print.pause', { }, 'respondPrintPause');
            },
            btnResumeJob() {
                // TODO loading button
                //this.$store.commit('setLoading', { name: 'statusPrintResume' });
                this.$socket.sendObj('printer.print.resume', { }, 'respondPrintResume');
            },
            btnCancelJob() {
                // TODO loading button
                //this.$store.commit('setLoading', { name: 'statusPrintCancel' });
                this.$socket.sendObj('printer.print.cancel', { }, 'respondPrintCancel');
            },
            btnClearJob() {
                // TODO loading button
                //this.$store.commit('setLoading', {name: 'statusPrintClear'});
                this.$socket.sendObj('printer.gcode.script', {script: 'SDCARD_RESET_FILE'}, 'respondPrintClear');
            },
            btnReprintJob() {
                // TODO loading button
                //this.$store.commit('setLoading', {name: 'statusPrintReprint'});
                this.$socket.sendObj('printer.print.start', { filename: this.current_filename }, 'respondPrintReprint');
            },
            formatTime(seconds) {
                let h = Math.floor(seconds / 3600);
                seconds %= 3600;
                let m = ("0" + Math.floor(seconds / 60)).slice(-2);
                let s = ("0" + (seconds % 60).toFixed(0)).slice(-2);

                return h+':'+m+':'+s;
            },
        },
        watch: {
            /*loadings: function(loadings) {
                this.loadingStatusCancel = loadings.includes('statusPrintCancel');
                this.loadingStatusResume = loadings.includes('statusPrintResume');
                this.loadingStatusPause = loadings.includes('statusPrintPause');
                this.loadingStatusClear = loadings.includes('statusPrintClear');
                this.loadingStatusReprint = loadings.includes('statusPrintReprint');
            }*/
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
