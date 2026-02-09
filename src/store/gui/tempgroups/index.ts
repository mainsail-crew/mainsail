import { Module } from 'vuex'
import { actions } from '@/store/gui/tempgroups/actions'
import { mutations } from '@/store/gui/tempgroups/mutations'
import { getters } from '@/store/gui/tempgroups/getters'
import { GuiTempgroupsState } from '@/store/gui/tempgroups/types'

export const getDefaultState = (): GuiTempgroupsState => {
    return {
        showAllTab: true,
        activeGroupId: null,
        groups: {},
    }
}

const state = getDefaultState()

// eslint-disable-next-line
export const tempgroups: Module<GuiTempgroupsState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
