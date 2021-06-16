<template>
    <v-row>
        <v-col class="col-sm-12 col-md-5">
            <min-settings-panel></min-settings-panel>
            <moonraker-state-panel></moonraker-state-panel>
            <klippy-state-panel></klippy-state-panel>
            <status-panel></status-panel>
            <webcam-panel v-if="showDashboardWebcam"></webcam-panel>
            <z-offset-panel></z-offset-panel>
            <control-panel></control-panel>
            <miscellaneous-panel></miscellaneous-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-7">
            <tools-panel></tools-panel>
            <miniconsole-panel></miniconsole-panel>
        </v-col>
    </v-row>
</template>

<script lang="ts">

import Component from "vue-class-component";
import {Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import MinSettingsPanel from "@/components/panels/MinSettingsPanel.vue";
import KlippyStatePanel from "@/components/panels/KlippyStatePanel.vue";
import MoonrakerStatePanel from "@/components/panels/MoonrakerStatePanel.vue";
import StatusPanel from "@/components/panels/StatusPanel.vue";
import ToolsPanel from "@/components/panels/ToolsPanel.vue";
import WebcamPanel from "@/components/panels/WebcamPanel.vue";
import ZOffsetPanel from "@/components/panels/ZOffsetPanel.vue";
import ControlPanel from "@/components/panels/ControlPanel.vue";
import MiscellaneousPanel from "@/components/panels/MiscellaneousPanel.vue";
import MiniconsolePanel from "@/components/panels/MiniconsolePanel.vue";

@Component({
    components: {
        MiniconsolePanel,
        MiscellaneousPanel,
        ControlPanel,
        ZOffsetPanel,
        WebcamPanel,
        ToolsPanel,
        StatusPanel,
        MoonrakerStatePanel,
        KlippyStatePanel,
        MinSettingsPanel
    }
})
export default class PageDashboard extends Mixins(BaseMixin) {

    get showDashboardWebcam() {
        return this.$store.state.gui.dashboard.boolWebcam
    }

}

/*

    export default {
        computed: {
            ...mapState({
                socket_connected: state => state.socket.isConnected,
                klippy_connected: state => state.server.klippy_connected,
                klippy_state: state => state.server.klippy_state,
                moonrakerFailedComponents: state => state.server.failed_components,
                moonrakerWarnings: state => state.server.warnings,

                showDashboardWebcam: state => state.gui.dashboard.boolWebcam,
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                config: state => state.printer.configfile.config,
            }),
            displayToolsPanel: {
                get() {
                    return (
                        this.$store.state.socket.isConnected &&
                        this.$store.state.server.klippy_connected &&
                        'heaters' in this.$store.state.printer &&
                        'available_heaters' in this.$store.state.printer.heaters &&
                        this.$store.state.printer.heaters.available_heaters.length
                    )
                }
            }
        },
    }*/
</script>
