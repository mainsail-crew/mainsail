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
            <printsettings-panel></printsettings-panel>
            <miscellaneous-panel></miscellaneous-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-7">
            <tools-panel></tools-panel>
            <miniconsole-panel v-if="showDashboardConsole"></miniconsole-panel>
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
import PrintsettingsPanel from "@/components/panels/PrintsettingsPanel.vue";

@Component({
    components: {
        PrintsettingsPanel,
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
        return this.$store.state.gui.webcam.boolDashboard
    }

    get showDashboardConsole() {
        return this.$store.state.gui.console.boolDashboard
    }
}
</script>