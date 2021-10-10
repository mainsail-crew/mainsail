import Vue from 'vue'
import Vuex from 'vuex'
import {actions} from '@/store/actions'
import {mutations} from '@/store/mutations'
import {getters} from '@/store/getters'
import { RootState } from './types'

// load modules
import { socket } from '@/store/socket'
import { server } from '@/store/server'
import { printer } from '@/store/printer'
import { files } from '@/store/files'
import { gui } from '@/store/gui'
import { farm } from '@/store/farm'
import { editor } from '@/store/editor'
import { gcodeviewer } from '@/store/gcodeviewer'

Vue.use(Vuex)

export const getDefaultState = (): RootState => {
    return {
        packageVersion: process.env.PACKAGE_VERSION || '0.0.0',
        debugMode: process.env.VUE_APP_DEBUG_MODE || false,
        naviDrawer: null,
    }
}

const state = getDefaultState()

export default new Vuex.Store({
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
    actions: actions
})
