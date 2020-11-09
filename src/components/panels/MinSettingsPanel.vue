<template>
    <v-card
        class="mb-6"
        v-if="
            !boolVirtualSdcard ||
            !boolPauseResume ||
            !boolDisplayStatus ||
            !boolMacroPause ||
            !boolMacroResume ||
            !boolMacroCancelPrint
        ">
        <v-list-item>
            <v-list-item-avatar color="grey">
                <v-icon dark>mdi-alert-circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Missing configuration</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left">
                    <p v-if="!boolVirtualSdcard"><code>virtual_sdcard</code> is not defined in config.</p>
                    <p v-if="!boolPauseResume"><code>pause_resume</code> is not defined in config.</p>
                    <p v-if="!boolDisplayStatus"><code>display_status</code> is not defined in config.</p>
                    <p v-if="!boolMacroPause"><code>gcode_macro PAUSE</code> is not defined in config.</p>
                    <p v-if="!boolMacroResume"><code>gcode_macro RESUME</code> is not defined in config.</p>
                    <p v-if="!boolMacroCancelPrint"><code>gcode_macro CANCEL_PRINT</code> is not defined in config.</p>
                    <p class="mb-0"><a href="https://github.com/meteyou/mainsail/wiki/Printer.cfg" target="_blank">Here you will find more information.</a></p>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapMutations, mapState, mapGetters } from 'vuex';

    export default {
        data: () => ({
            boolVirtualSdcard: false,
            boolPauseResume: false,
            boolDisplayStatus: false,
            boolMacroPause: false,
            boolMacroResume: false,
            boolMacroCancelPrint: false,
        }),
        computed: {
            ...mapState({
                state: state => state.printer.webhooks.state,
                config: state => state.printer.configfile.config,
            }),
            ...mapMutations([

            ]),
            ...mapGetters([
                'checkConfigVirtualSdcard',
                'checkConfigPauseResume',
                'checkConfigDisplayStatus',
                'checkConfigMacroPause',
                'checkConfigMacroResume',
                'checkConfigMacroCancel',
            ]),
        },
        created() {
            this.refreshConfig();
        },
        methods: {
            refreshConfig() {
                this.boolVirtualSdcard = this.checkConfigVirtualSdcard;
                this.boolPauseResume = this.checkConfigPauseResume;
                this.boolDisplayStatus = this.checkConfigDisplayStatus;
                this.boolMacroPause = this.checkConfigMacroPause;
                this.boolMacroResume = this.checkConfigMacroResume;
                this.boolMacroCancelPrint = this.checkConfigMacroCancel;
            }
        },
        watch: {
            config: {
                deep: true,
                handler() {
                    this.refreshConfig();
                }
            }
        }
    }
</script>

<style scoped>
    .content span,
    .content strong {
        padding-left: 8px;
        padding-right: 8px;
        white-space: pre-wrap;
    }
</style>