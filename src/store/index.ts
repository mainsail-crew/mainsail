import { createStore } from 'vuex'
import { actions } from '@/store/actions'
import { mutations } from '@/store/mutations'
import { getters } from '@/store/getters'
import { RootState } from './types'

import { socket } from '@/store/socket'
import { server } from '@/store/server'
import { printer } from '@/store/printer'
import { files } from '@/store/files'
import { gui } from '@/store/gui'
import { farm } from '@/store/farm'
import { editor } from '@/store/editor'
import { gcodeviewer } from '@/store/gcodeviewer'

export const getDefaultState = (): RootState => {
    return {
        packageVersion: (import.meta.env.PACKAGE_VERSION as string) || '0.0.0',
        debugMode: (import.meta.env.VUE_APP_DEBUG_MODE as boolean) || false,
        naviDrawer: null,
        instancesDB: 'moonraker',
        configInstances: [],
    }
}

const state = getDefaultState()

export default createStore({
    state,
    modules: {
        socket,
        server,
        printer,
        files,
        gui,
        farm,
        editor,
        gcodeviewer,
    },
    getters: getters,
    mutations: mutations,
    actions: actions,
})
