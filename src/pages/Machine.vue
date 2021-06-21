<template>
    <v-container fluid py-0 px-0>
        <v-row>
            <v-col class="col-12 col-sm-6">
                <config-files-panel></config-files-panel>
            </v-col>
            <v-col class="col-12 col-sm-6">
                <klippy-state-panel></klippy-state-panel>
                <limits-panel></limits-panel>
                <update-panel></update-panel>
                <v-row class="mt-6">
                    <v-col class="col-md-6" v-if="klipperState === 'ready'">
                        <endstop-panel></endstop-panel>
                    </v-col>
                    <v-col :class="(klipperState !== 'ready' ? 'col-md-12' : 'col-md-6')">
                        <logfiles-panel></logfiles-panel>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";
import KlippyStatePanel from "@/components/panels/KlippyStatePanel.vue";
import LimitsPanel from "@/components/panels/Machine/LimitsPanel.vue";
import UpdatePanel from "@/components/panels/Machine/UpdatePanel.vue";
import LogfilesPanel from "@/components/panels/Machine/LogfilesPanel.vue";
import EndstopPanel from "@/components/panels/Machine/EndstopPanel.vue";
import ConfigFilesPanel from "@/components/panels/Machine/ConfigFilesPanel.vue";
@Component({
    components: {ConfigFilesPanel, EndstopPanel, LogfilesPanel, UpdatePanel, LimitsPanel, KlippyStatePanel}
})
export default class PageMachine extends Mixins(BaseMixin) {

}
</script>