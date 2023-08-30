import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServerSpoolmanState } from './types'

export const actions: ActionTree<ServerSpoolmanState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init({ dispatch }) {
        Vue.$socket.emit('server.spoolman.get_spool_id', {}, { action: 'server/spoolman/getSpoolId' })
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/info',
            },
            { action: 'server/spoolman/getInfo' }
        )
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/health',
            },
            { action: 'server/spoolman/getHealth' }
        )
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/vendor',
            },
            { action: 'server/spoolman/getVendors' }
        )

        dispatch('socket/addInitModule', 'server/spoolman/getSpoolId', { root: true })
        dispatch('socket/addInitModule', 'server/spoolman/getHealth', { root: true })
        dispatch('socket/addInitModule', 'server/spoolman/getInfo', { root: true })
        dispatch('socket/addInitModule', 'server/spoolman/getVendors', { root: true })

        dispatch('socket/removeInitModule', 'server/spoolman/init', { root: true })
    },

    getSpoolId({ commit, dispatch }, payload) {
        commit('setSpoolId', payload.spool_id)
        dispatch('socket/removeInitModule', 'server/spoolman/getSpoolId', { root: true })
    },

    getHealth({ commit, dispatch }, payload) {
        delete payload.requestParams
        commit('setHealth', payload.status)
        dispatch('socket/removeInitModule', 'server/spoolman/getHealth', { root: true })
    },

    getInfo({ commit, dispatch }, payload) {
        delete payload.requestParams
        commit('setInfo', payload)
        dispatch('socket/removeInitModule', 'server/spoolman/getInfo', { root: true })
    },

    getVendors({ commit, dispatch }, payload) {
        delete payload.requestParams
        commit(
            'setVendors',
            Object.entries(payload).map((value) => value)
        )
        dispatch('socket/removeInitModule', 'server/spoolman/getVendors', { root: true })
    },
}