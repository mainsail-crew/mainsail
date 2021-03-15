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
        <v-toolbar flat dense color="orange darken-2">
            <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-alert-circle" left></v-icon>{{ $t("Panels.MinSettingsPanel.MissingConfiguration") }}
                    </span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left">
                    <p v-if="!boolVirtualSdcard" class="orange--text"><code>virtual_sdcard</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}</p>
                    <p v-if="!boolPauseResume" class="orange--text"><code>pause_resume</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}</p>
                    <p v-if="!boolDisplayStatus" class="orange--text"><code>display_status</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}</p>
                    <p v-if="!boolMacroPause" class="orange--text"><code>gcode_macro PAUSE</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}</p>
                    <p v-if="!boolMacroResume" class="orange--text"><code>gcode_macro RESUME</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}</p>
                    <p v-if="!boolMacroCancelPrint" class="orange--text"><code>gcode_macro CANCEL_PRINT</code> {{ $t("Panels.MinSettingsPanel.IsNotDefinedInConfig") }}</p>
                    <div class="text-center">
                        <v-btn href="https://docs.mainsail.xyz/necessary-configuration" target="_blank" color="white" outlined small><v-icon small class="mr-1">mdi-information</v-icon>{{ $t("Panels.MinSettingsPanel.MoreInformation") }}</v-btn>
                    </div>
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