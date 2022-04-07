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
import ControlPanel from '@/components/panels/ControlPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import MachineSettingsPanel from '@/components/panels/MachineSettings/MachineSettingsPanel.vue'
import MacrogroupPanel from '@/components/panels/MacrogroupPanel.vue'
import MacrosPanel from '@/components/panels/MacrosPanel.vue'
import MiniconsolePanel from '@/components/panels/MiniconsolePanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MiscellaneousPanel from '@/components/panels/MiscellaneousPanel.vue'
import MoonrakerStatePanel from '@/components/panels/MoonrakerStatePanel.vue'
import PrintsettingsPanel from '@/components/panels/PrintsettingsPanel.vue'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'
import ZoffsetPanel from '@/components/panels/ZoffsetPanel.vue'
import kebabCase from 'lodash.kebabcase'

@Component({
    components: {
        ControlPanel,
        KlippyStatePanel,
        MachineSettingsPanel,
        MacrogroupPanel,
        MacrosPanel,
        MiniconsolePanel,
        MinSettingsPanel,
        MiscellaneousPanel,
        MoonrakerStatePanel,
        PrintsettingsPanel,
        StatusPanel,
        TemperaturePanel,
        WebcamPanel,
        ZoffsetPanel,
    },
})
export default class PageDashboard extends Mixins(DashboardMixin) {
    get allComponents() {
        const output: string[] = []
        const components = Object.keys(this.$options.components ?? {})

        components?.forEach((component) => {
            if (component.endsWith('Panel')) output.push(kebabCase(component))
        })

        return output
    }

    get mobileLayout() {
        let panels = this.$store.getters['gui/getPanels']('mobileLayout')
        panels = panels.concat(this.missingPanelsMobile)
        panels = panels.filter(
            (element: any) => element.visible && this.allComponents.includes(this.extractPanelName(element.name))
        )

        return panels
    }

    get tabletLayout1() {
        let panels = this.$store.getters['gui/getPanels']('tabletLayout1')
        panels = panels.concat(this.missingPanelsTablet)
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
        panels = panels.concat(this.missingPanelsDesktop)
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
        panels = panels.concat(this.missingPanelsWidescreen)
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
