import { Module } from 'vuex'
import { ServerSpoolmanState } from '@/store/server/spoolman/types'
import { actions } from '@/store/server/spoolman/actions'
import { mutations } from '@/store/server/spoolman/mutations'
import { getters } from '@/store/server/spoolman/getters'

export const getDefaultState = (): ServerSpoolmanState => {
    return {
        health: '',
        info: {
            automatic_backups: false,
            backups_dir: '',
            data_dir: '',
            debug_mode: false,
            version: '',
        },
        active_spool_id: null,
        active_spool: null,
        vendors: [],
        feeds: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const spoolman: Module<ServerSpoolmanState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
