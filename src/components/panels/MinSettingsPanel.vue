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
        <v-toolbar flat dense>
            <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-alert-circle" left></v-icon>Missing configuration
                    </span>
            </v-toolbar-title>
        </v-toolbar>
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
                config: state => state.printer.configfile.config,
            }),
            ...mapMutations([

            ]),
            ...mapGetters([
                'printer/checkConfigVirtualSdcard',
                'printer/checkConfigPauseResume',
                'printer/checkConfigDisplayStatus',
                'printer/checkConfigMacroPause',
                'printer/checkConfigMacroResume',
                'printer/checkConfigMacroCancel',
            ]),
        },
        created() {
            this.refreshConfig();
        },
        methods: {
            refreshConfig() {
                this.boolVirtualSdcard = this['printer/checkConfigVirtualSdcard'];
                this.boolPauseResume = this['printer/checkConfigPauseResume'];
                this.boolDisplayStatus = this['printer/checkConfigDisplayStatus'];
                this.boolMacroPause = this['printer/checkConfigMacroPause'];
                this.boolMacroResume = this['printer/checkConfigMacroResume'];
                this.boolMacroCancelPrint = this['printer/checkConfigMacroCancel'];
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