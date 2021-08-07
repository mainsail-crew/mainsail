<template>
    <div>
        <v-row v-if="isMobile">
            <v-col>
                <status-panel></status-panel>
                <template v-for="component in mobileLayout">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-mobileLayout-'+component.name"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isTablet">
            <v-col class="col-6">
                <status-panel></status-panel>
                <template v-for="component in tabletLayout1">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-tabletLayout1-'+component.name"></component>
                </template>
            </v-col>
            <v-col class="col-6">
                <template v-for="component in tabletLayout2">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-tabletLayout2-'+component.name"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isDesktop">
            <v-col class="col-5">
                <status-panel></status-panel>
                <template v-for="component in desktopLayout1">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-desktopLayout1-'+component.name"></component>
                </template>
            </v-col>
            <v-col class="col-7">
                <template v-for="component in desktopLayout2">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-desktopLayout2-'+component.name"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isWidescreen">
            <v-col class="col-3">
                <status-panel></status-panel>
                <template v-for="component in widescreenLayout1">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-desktopLayout1-'+component.name"></component>
                </template>
            </v-col>
            <v-col class="col-5">
                <template v-for="component in widescreenLayout2">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-desktopLayout2-'+component.name"></component>
                </template>
            </v-col>
            <v-col class="col-4">
                <template v-for="component in widescreenLayout3">
                    <component v-bind:is="component.name+'-panel'" :key="'dashboard-desktopLayout3-'+component.name"></component>
                </template>
            </v-col>
        </v-row>
    </div>
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
import ZoffsetPanel from "@/components/panels/ZoffsetPanel.vue";
import ControlPanel from "@/components/panels/ControlPanel.vue";
import MacrosPanel from "@/components/panels/MacrosPanel.vue";
import MiscellaneousPanel from "@/components/panels/MiscellaneousPanel.vue";
import MiniconsolePanel from "@/components/panels/MiniconsolePanel.vue";
import PrintsettingsPanel from "@/components/panels/PrintsettingsPanel.vue";

@Component({
    components: {
        PrintsettingsPanel,
        MiniconsolePanel,
        MiscellaneousPanel,
        ControlPanel,
        MacrosPanel,
        ZoffsetPanel,
        WebcamPanel,
        ToolsPanel,
        StatusPanel,
        MoonrakerStatePanel,
        KlippyStatePanel,
        MinSettingsPanel
    }
})
export default class PageDashboard extends Mixins(BaseMixin) {
    get mobileLayout() {
        return this.$store.state.gui.dashboard.mobileLayout.filter((element: any) => element.visable) ?? []
    }

    get tabletLayout1() {
        return this.$store.state.gui.dashboard.tabletLayout1.filter((element: any) => element.visable) ?? []
    }

    get tabletLayout2() {
        return this.$store.state.gui.dashboard.tabletLayout2.filter((element: any) => element.visable) ?? []
    }

    get desktopLayout1() {
        return this.$store.state.gui.dashboard.desktopLayout1.filter((element: any) => element.visable) ?? []
    }

    get desktopLayout2() {
        return this.$store.state.gui.dashboard.desktopLayout2.filter((element: any) => element.visable) ?? []
    }

    get widescreenLayout1() {
        return this.$store.state.gui.dashboard.widescreenLayout1.filter((element: any) => element.visable) ?? []
    }

    get widescreenLayout2() {
        return this.$store.state.gui.dashboard.widescreenLayout2.filter((element: any) => element.visable) ?? []
    }

    get widescreenLayout3() {
        return this.$store.state.gui.dashboard.widescreenLayout3.filter((element: any) => element.visable) ?? []
    }
}
</script>