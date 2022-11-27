import Component from 'vue-class-component'
import BaseMixin from '@/components/mixins/base'
import { allDashboardPanels } from '@/store/variables'
import { capitalize } from '@/plugins/helpers'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import {
    mdiArrowCollapseVertical,
    mdiCodeTags,
    mdiConsoleLine,
    mdiDipSwitch,
    mdiEngine,
    mdiGamepad,
    mdiInformation,
    mdiPrinter3dNozzle,
    mdiThermometerLines,
    mdiWebcam,
} from '@mdi/js'

@Component
export default class DashboardMixin extends BaseMixin {
    get printerKinematics() {
        return this.$store.getters['printer/getKinematics']
    }

    get printerExtruderCount() {
        return this.$store.getters['printer/getExtruders'].length
    }

    get printerAvailableHeatersCount() {
        return this.$store.getters['printer/getAvailableHeaters'].length
    }

    get printerTemperatureSensorsCount() {
        return this.$store.getters['printer/getTemperatureSensorKeys'].length
    }

    get macrogroups() {
        return this.$store.getters['gui/macros/getAllMacrogroups'] ?? []
    }

    get webcams() {
        return this.$store.getters['gui/webcams/getWebcams'] ?? []
    }

    checkMissingPanels(panels: any[]) {
        const missingPanels: any[] = []
        const allPossiblePanels = this.$store.getters['gui/getAllPossiblePanels']

        allPossiblePanels.forEach((panelname: string) => {
            if (!panels.find((panel) => panel.name === panelname))
                missingPanels.push({
                    name: panelname,
                    visible: true,
                })
        })

        return missingPanels
    }

    getPanelName(name: string) {
        if (name.startsWith('macrogroup_')) {
            const groupId = name.split('_')[1] ?? ''
            const group = this.macrogroups.find((group: GuiMacrosStateMacrogroup) => group.id === groupId)

            return group ? group.name : 'Macrogroup'
        }

        if (name.includes('-')) {
            let panelName = ''
            const subStrings = name.split('-')
            subStrings.forEach((subStr) => {
                panelName += capitalize(subStr)
            })
            return this.$t(`Panels.${panelName}Panel.Headline`)
        }

        return this.$t(`Panels.${capitalize(name)}Panel.Headline`)
    }

    convertPanelnameToIcon(name: string): string {
        if (name.startsWith('macrogroup_')) return mdiCodeTags

        switch (name) {
            case 'webcam':
                return mdiWebcam
            case 'zoffset':
                return mdiArrowCollapseVertical
            case 'toolhead-control':
                return mdiGamepad
            case 'macros':
                return mdiCodeTags
            case 'miscellaneous':
                return mdiDipSwitch
            case 'temperature':
                return mdiThermometerLines
            case 'miniconsole':
                return mdiConsoleLine
            case 'machine-settings':
                return mdiEngine
            case 'extruder-control':
                return mdiPrinter3dNozzle

            default:
                return mdiInformation
        }
    }
}
