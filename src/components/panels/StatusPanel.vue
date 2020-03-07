<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>fa-info</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Status</v-list-item-title>
                <v-list-item-subtitle>{{ toolhead !== null && 'status' in toolhead ? toolhead.status : "" }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-btn class="orange" v-if="toolhead && toolhead.status === 'Printing'" @click="btnPauseJob" :loading="btnStatusPause">pause job</v-btn>
            <v-btn class="orange" v-if="(toolhead && toolhead.status === 'Ready') && is_paused" :loading="btnStatusResume" @click="btnResumeJob">resume job</v-btn>
            <v-btn class="red ml-2" v-if="(toolhead && toolhead.status === 'Ready') && is_paused" :loading="btnStatusCancel" @click="btnCancelJob">cancel job</v-btn>
        </v-list-item>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
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
            <v-divider class="my-2" v-if="(toolhead && toolhead.status === 'Printing') || is_paused"></v-divider>
            <v-layout wrap class=" text-center" v-if="(toolhead && toolhead.status === 'Printing') || is_paused">
                <v-flex col tag="strong" class="category-header">
                    Printstatus
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">printing</v-flex>
                        <v-flex tag="span">{{ formatTime(toolhead.printing_time) }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">estimated</v-flex>
                        <v-flex tag="span">{{ formatTime(print_time) }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">total</v-flex>
                        <v-flex tag="span">{{ formatTime(print_time + toolhead.printing_time) }}</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <v-layout wrap class=" text-center" v-if="(toolhead && toolhead.status === 'Printing') || is_paused">
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
    import { mapState } from 'vuex';

    export default {
        data: () => ({
            progress: 0.15
        }),
        computed: {
            ...mapState({
                toolhead: state => state.printer.toolhead,
                position: state => state.printer.toolhead.position,
                is_paused: state => state.printer.pause_resume.is_paused,
                btnStatusPause: state => state.socket.loadingPrintPause,
                btnStatusResume: state => state.socket.loadingPrintResume,
                btnStatusCancel: state => state.socket.loadingPrintCancel,
                printProgress: state => state.printer.virtual_sdcard.progress,
                print_time: state => state.printer.idle_timeout.printing_time,
            }),
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
                let date = new Date(null);
                date.setSeconds(seconds);

                return date.toISOString().substr(11,8);
            }
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