<template>
    <div>
        <v-row v-if="isMobile">
            <v-col>
                <status-panel></status-panel>
                <template v-for="component in mobileLayout">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-mobileLayout-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isTablet">
            <v-col class="col-6">
                <status-panel></status-panel>
                <template v-for="component in tabletLayout1">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-tabletLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-6">
                <template v-for="component in tabletLayout2">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-tabletLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isDesktop">
            <v-col class="col-5">
                <status-panel></status-panel>
                <template v-for="component in desktopLayout1">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-7">
                <template v-for="component in desktopLayout2">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isWidescreen">
            <v-col class="col-3">
                <status-panel></status-panel>
                <template v-for="component in widescreenLayout1">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-5">
                <template v-for="component in widescreenLayout2">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-4">
                <template v-for="component in widescreenLayout3">
                    <component
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout3-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import ExtruderControlPanel from '@/components/panels/ExtruderControlPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import MachineSettingsPanel from '@/components/panels/MachineSettings/MachineSettingsPanel.vue'
import MacrogroupPanel from '@/components/panels/MacrogroupPanel.vue'
import MacrosPanel from '@/components/panels/MacrosPanel.vue'
import MiniconsolePanel from '@/components/panels/MiniconsolePanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MiscellaneousPanel from '@/components/panels/MiscellaneousPanel.vue'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import ToolheadControlPanel from '@/components/panels/ToolheadControlPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'
import kebabCase from 'lodash.kebabcase'

@Component({
    components: {
        ExtruderControlPanel,
        KlippyStatePanel,
        MachineSettingsPanel,
        MacrogroupPanel,
        MacrosPanel,
        MiniconsolePanel,
        MinSettingsPanel,
        MiscellaneousPanel,
        StatusPanel,
        ToolheadControlPanel,
        TemperaturePanel,
        WebcamPanel,
    },
})
export default class PageDashboard extends Mixins(DashboardMixin) {
    get allComponents() {
        let output: string[] = []
        const components = Object.keys(this.$options.components ?? {})

        components?.forEach((component) => {
            if (component.endsWith('Panel')) output.push(kebabCase(component))
        })

        // remove toolhead panel, if kinematics === none
        if (this.printerKinematics === 'none') {
            output = output.filter((name) => name !== 'toolhead-control-panel')
        }

        // remove extruder panel, if printerExtruderCount < 1
        if (this.printerExtruderCount < 1) {
            output = output.filter((name) => name !== 'extruder-control-panel')
        }

        // remove temperature panel, if heaters & sensors < 1
        if (this.printerAvailableHeatersCount + this.printerTemperatureSensorsCount < 1) {
            output = output.filter((name) => name !== 'temperature-panel')
        }

        return output
    }

    get mobileLayout() {
        let panels = this.$store.getters['gui/getPanels']('mobileLayout')
        const allViewportPanels = this.$store.getters['gui/getAllPanelsFromViewport']('mobile')
        panels = panels.concat(this.checkMissingPanels(allViewportPanels))
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get tabletLayout1() {
        let panels = this.$store.getters['gui/getPanels']('tabletLayout1')
        const allViewportPanels = this.$store.getters['gui/getAllPanelsFromViewport']('tablet')
        panels = panels.concat(this.checkMissingPanels(allViewportPanels))
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get tabletLayout2() {
        let panels = this.$store.getters['gui/getPanels']('tabletLayout2')
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get desktopLayout1() {
        let panels = this.$store.getters['gui/getPanels']('desktopLayout1')
        const allViewportPanels = this.$store.getters['gui/getAllPanelsFromViewport']('desktop')
        panels = panels.concat(this.checkMissingPanels(allViewportPanels))
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get desktopLayout2() {
        let panels = this.$store.getters['gui/getPanels']('desktopLayout2')
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get widescreenLayout1() {
        let panels = this.$store.getters['gui/getPanels']('widescreenLayout1')
        const allViewportPanels = this.$store.getters['gui/getAllPanelsFromViewport']('widescreen')
        panels = panels.concat(this.checkMissingPanels(allViewportPanels))
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get widescreenLayout2() {
        let panels = this.$store.getters['gui/getPanels']('widescreenLayout2')
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get widescreenLayout3() {
        let panels = this.$store.getters['gui/getPanels']('widescreenLayout3')
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    extractPanelName(name: string) {
        return name.split('_')[0] + '-panel'
    }

    extractPanelId(name: string) {
        return name.split('_')[1] ?? null
    }
}
</script>
