import Component from 'vue-class-component'
import BaseMixin from '@/components/mixins/base'
import {allDashboardPanels} from '@/store/variables'
import {GuiStateMacrogroup} from '@/store/gui/types'
import {capitalize} from '@/plugins/helpers'

@Component
export default class DashboardMixin extends BaseMixin {

    get macroMode() {
        return this.$store.state.gui.dashboard.macroManagement ?? 'simple'
    }

    get macrogroups() {
        return this.$store.state.gui.dashboard.macrogroups ?? []
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

        if (this.macroMode === 'expert') {
            this.macrogroups.forEach((group: GuiStateMacrogroup) => {
                allPanels.push('macrogroup_'+group.id)
            })

            allPanels = allPanels.filter((name) => name !== 'macros')
        }

        allPanels.forEach((panelname) => {
            if (!panels.find((panel) => panel.name === panelname))
                missingPanels.push({
                    name: panelname,
                    visable: true
                })
        })

        return missingPanels
    }

    getPanelName(name: string) {
        if (name.startsWith('macrogroup_')) {
            const groupId = name.split('_')[1] ?? ''
            const group = this.macrogroups.find((group: GuiStateMacrogroup) => group.id === groupId)

            return (group) ? group.name : 'Macrogroup'
        }

        return this.$t('Panels.'+capitalize(name)+'Panel.Headline')
    }
}