import Component from 'vue-class-component'
import BaseMixin from '@/components/mixins/base'
import {allDashboardPanels} from '@/store/variables'
import {capitalize} from '@/plugins/helpers'
import {GuiMacrosStateMacrogroup} from '@/store/gui/macros/types'

@Component
export default class DashboardMixin extends BaseMixin {

    get macroMode() {
        return this.$store.state.gui.macros.mode ?? 'simple'
    }

    get macrogroups() {
        return this.$store.getters['gui/macros/getAllMacrogroups'] ?? []
    }


    get webcams() {
        return this.$store.getters['gui/webcams/getWebcams'] ?? []
    }

    get missingPanelsMobile() {
        const panels = [
            ...this.$store.state.gui.dashboard.mobileLayout,
        ]

        return this.checkMissingPanels(panels)
    }

    get missingPanelsTablet() {
        const panels = [
            ...this.$store.state.gui.dashboard.tabletLayout1,
            ...this.$store.state.gui.dashboard.tabletLayout2,
        ]

        return this.checkMissingPanels(panels)
    }

    get missingPanelsDesktop() {
        const panels = [
            ...this.$store.state.gui.dashboard.desktopLayout1,
            ...this.$store.state.gui.dashboard.desktopLayout2,
        ]

        return this.checkMissingPanels(panels)
    }

    get missingPanelsWidescreen() {
        const panels = [
            ...this.$store.state.gui.dashboard.widescreenLayout1,
            ...this.$store.state.gui.dashboard.widescreenLayout2,
            ...this.$store.state.gui.dashboard.widescreenLayout3,
        ]

        return this.checkMissingPanels(panels)
    }

    checkMissingPanels(panels: any[]) {
        let allPanels = [...allDashboardPanels]
        const missingPanels: any[] = []

        // remove macros panel and add macrogroups panels if macroMode === expert
        if (this.macroMode === 'expert') {
            this.macrogroups.forEach((group: GuiMacrosStateMacrogroup) => {
                allPanels.push('macrogroup_'+group.id)
            })

            allPanels = allPanels.filter((name) => name !== 'macros')
        }

        // remove webcam panel, if no webcam exists
        if (this.webcams.length === 0) {
            allPanels = allPanels.filter((name) => name !== 'webcam')
        }

        allPanels.forEach((panelname) => {
            if (!panels.find((panel) => panel.name === panelname))
                missingPanels.push({
                    name: panelname,
                    visible: true
                })
        })

        return missingPanels
    }

    getPanelName(name: string) {
        if (name.startsWith('macrogroup_')) {
            const groupId = name.split('_')[1] ?? ''
            const group = this.macrogroups.find((group: GuiMacrosStateMacrogroup) => group.id === groupId)

            return (group) ? group.name : 'Macrogroup'
        }

        if (name.includes('-')) {
            let panelName = ''
            const subStrings = name.split('-')
            subStrings.forEach((subStr) => {panelName += capitalize(subStr)})
            return this.$t('Panels.' + panelName + 'Panel.Headline')
        }

        return this.$t('Panels.' + capitalize(name) + 'Panel.Headline')
    }
}