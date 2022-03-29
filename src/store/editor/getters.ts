import { GetterTree } from 'vuex'
import { EditorState } from '@/store/editor/types'

export const getters: GetterTree<EditorState, any> = {
    getKlipperRestartMethod: (state, getters, rootState) => {
        return rootState.gui.editor?.klipperRestartMethod ?? 'FIRMWARE_RESTART'
    },

    getMoonrakerRestartInstance: (state, getters, rootState) => {
        const available_services = rootState.server?.system_info?.available_services ?? []
        const setting = rootState.gui.editor?.moonrakerRestartInstance ?? 'moonraker'

        if (available_services.includes(setting)) return setting

        return 'moonraker'
    },
}
