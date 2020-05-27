<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-information-variant</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Status</v-list-item-title>
                <v-list-item-subtitle class="mr-3">{{ printer_state }}{{ printer_is_printing ? " - "+current_file : "" }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-btn class="orange" v-if="printer_state === 'Printing' && printer_is_printing" @click="btnPauseJob" :loading="btnStatusPause">pause job</v-btn>
            <v-btn class="red" v-if="(is_printing && printer_is_paused)" :loading="btnStatusCancel" @click="btnCancelJob">cancel job</v-btn>
            <v-btn class="orange ml-2" v-if="(is_printing && printer_is_paused)" :loading="btnStatusResume" @click="btnResumeJob">resume job</v-btn>
        </v-list-item>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center" v-if="display_message">
                <v-flex col tag="strong" class="category-header">Message</v-flex>
                <v-flex col class="text-left">{{ display_message }}</v-flex>
            </v-layout>
            <v-divider class="my-2" v-if="display_message" ></v-divider>
            <v-layout wrap class=" text-center">
                <v-flex col tag="strong" class="category-header">
                    Position
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">X</v-flex>
                        <v-flex tag="span">{{ position.length ? position[0].toFixed(2) : "--" }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Y</v-flex>
                        <v-flex tag="span">{{ position.length ? position[1].toFixed(2) : "--" }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Z</v-flex>
                        <v-flex tag="span">{{ position.length ? position[2].toFixed(2) : "--" }}</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="my-2" v-if="is_printing"></v-divider>
            <v-layout wrap class=" text-center" v-if="is_printing">
                <v-flex col tag="strong" class="category-header">
                    Printstatus
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Filament used</v-flex>
                        <v-flex tag="span">{{ filament_used > 1000 ? (filament_used / 1000).toFixed(2)+"m" : filament_used.toFixed(2)+"mm" }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Print Time</v-flex>
                        <v-flex tag="span">{{ formatTime(print_time) }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Total Time</v-flex>
                        <v-flex tag="span">{{ formatTime(print_time_total) }}</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-divider class="my-2" v-if="is_printing"></v-divider>
            <v-layout wrap class=" text-center" v-if="is_printing">
                <v-flex col tag="strong" class="category-header py-0">
                    Estimations<br />based on
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">File</v-flex>
                        <v-flex tag="span">{{ print_time > 0 && printProgress > 0 ? formatTime(print_time / printProgress - print_time) : '--' }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Filament</v-flex>
                        <v-flex tag="span">{{ (filament_used > 0 && current_file_filament_total > filament_used) ? formatTime(print_time / (filament_used / current_file_filament_total) - print_time) : '--' }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Slicer</v-flex>
                        <v-flex tag="span">{{ current_file_estimated_time > print_time ? formatTime(current_file_estimated_time - print_time) : '--'}}</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-layout wrap class=" text-center" v-if="is_printing">
                <v-layout column class="mt-2" >
                    <v-progress-linear
                        :value="printProgress * 100"
                        height="25"
                    >
                        <template>
                            <strong>{{ Math.ceil(printProgress * 100) }}%</strong>
                        </template>
                    </v-progress-linear>
                </v-layout>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        computed: {
            ...mapState({
                toolhead: state => state.printer.toolhead,
                position: state => state.printer.toolhead.position,
                btnStatusPause: state => state.socket.loadingPrintPause,
                btnStatusResume: state => state.socket.loadingPrintResume,
                btnStatusCancel: state => state.socket.loadingPrintCancel,

                estimated_print_time: state => state.printer.toolhead.estimated_print_time,

                printProgress: state => state.printer.virtual_sdcard.progress,
                print_time: state => state.printer.virtual_sdcard.print_duration,
                print_time_total: state => state.printer.virtual_sdcard.total_duration,
                filament_used: state => state.printer.virtual_sdcard.filament_used,
                file_position: state => state.printer.virtual_sdcard.file_position,
                current_file: state => state.printer.virtual_sdcard.current_file,
                printer_state: state => state.printer.idle_timeout.state,
                printer_is_paused: state => state.printer.pause_resume.is_paused,
                printer_is_printing: state => state.printer.virtual_sdcard.is_active,

                display_message: state => state.printer.display_status.message,
            }),

            ...mapGetters([
                'current_file_size',
                'current_file_metadata',
                'current_file_estimated_time',
                'current_file_filament_total',
                'is_printing',
            ]),
        },
        methods: {
            btnPauseJob() {
                this.$store.commit('setLoadingPrintPause', true);
                this.$socket.sendObj('post_printer_print_pause', { }, 'setLoadingPrintPause');
            },
            btnResumeJob() {
                this.$store.commit('setLoadingPrintResume', true);
                this.$socket.sendObj('post_printer_print_resume', { }, 'setLoadingPrintResume');
            },
            btnCancelJob() {
                this.$store.commit('setLoadingPrintCancel', true);
                this.$socket.sendObj('post_printer_print_cancel', { }, 'setLoadingPrintCancel');
            },
            formatTime(seconds) {
                let h = Math.floor(seconds / 3600);
                seconds %= 3600;
                let m = ("0" + Math.floor(seconds / 60)).slice(-2);
                let s = ("0" + (seconds % 60).toFixed(0)).slice(-2);

                return h+':'+m+':'+s;
            },
        },
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