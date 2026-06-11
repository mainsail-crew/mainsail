import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
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
    mdiLedStrip,
    mdiThermometerLines,
    mdiWebcam,
    mdiAxisArrow,
    mdiCrosshairsGps,
    mdiHandBackRight,
    mdiTarget,
} from '@mdi/js'

export function useDashboard() {
    const store = useStore()
    const { t } = useI18n()
    const base = useBase()

    const macrogroups = computed(() => store.getters['gui/macros/getAllMacrogroups'] ?? [])

    const webcams = computed(() => store.getters['gui/webcams/getWebcams'] ?? [])

    function getPanelName(name: string) {
        if (name.startsWith('macrogroup_')) {
            const groupId = name.split('_')[1] ?? ''
            const group = macrogroups.value.find(
                (group: GuiMacrosStateMacrogroup) => group.id === groupId
            )

            return group ? group.name : 'Macrogroup'
        }

        switch (name) {
            case 'cnc-status':
                return 'CNC Status'
            case 'dro':
                return 'DRO'
            case 'jog':
                return 'Jog'
            case 'offsets':
                return 'Offsets'
            case 'spindle-coolant':
                return 'Spindle & Coolant'
            case 'mdi':
                return 'MDI'
        }

        if (name.includes('-')) {
            let panelName = ''
            const subStrings = name.split('-')
            subStrings.forEach((subStr) => {
                panelName += capitalize(subStr)
            })
            return t(`Panels.${panelName}Panel.Headline`)
        }

        return t(`Panels.${capitalize(name)}Panel.Headline`)
    }

    function convertPanelnameToIcon(name: string): string {
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
            case 'led-effects':
                return mdiLedStrip
            case 'temperature':
                return mdiThermometerLines
            case 'miniconsole':
                return mdiConsoleLine
            case 'machine-settings':
                return mdiEngine
            case 'cnc-status':
                return mdiAxisArrow
            case 'dro':
                return mdiCrosshairsGps
            case 'jog':
                return mdiHandBackRight
            case 'offsets':
                return mdiTarget
            case 'spindle-coolant':
                return mdiEngine
            case 'mdi':
                return mdiConsoleLine
            default:
                return mdiInformation
        }
    }

    return {
        ...base,
        macrogroups,
        webcams,
        getPanelName,
        convertPanelnameToIcon,
    }
}
