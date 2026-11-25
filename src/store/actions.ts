import router from '@/plugins/router'
import { ActionTree } from 'vuex'
import { ConfigJson, RootState } from './types'

export const actions: ActionTree<RootState, RootState> = {
    switchToDashboard() {
        if (router.currentRoute.fullPath !== '/') router.push('/')
    },

    changePrinter({ dispatch, state }, payload: { printer: string }) {
        const printerSocket = state.farm?.[payload.printer]?.socket
        if (!printerSocket) return

        const { hostname, port, path } = printerSocket

        dispatch('editor/reset')
        dispatch('files/reset')
        dispatch('gui/reset')
        dispatch('printer/reset')
        dispatch('server/reset')
        dispatch('socket/reset')
        dispatch('socket/setSocket', { hostname, port, path })
    },

    setNaviDrawer({ commit }, payload) {
        commit('setNaviDrawer', payload)
    },

    /**
     * This function will parse the config.json content and config mainsail
     */
    async importConfigJson({ commit }, payload: ConfigJson) {
        type RootStateInstancesDbType = 'moonraker' | 'browser' | 'json'
        let instancesDB: RootStateInstancesDbType = payload.instancesDB ?? 'moonraker'
        if (import.meta.env.VUE_APP_INSTANCES_DB)
            instancesDB = import.meta.env.VUE_APP_INSTANCES_DB as RootStateInstancesDbType

        if (instancesDB !== 'moonraker') {
            commit('setInstancesDB', instancesDB)

            if (
                instancesDB === 'json' &&
                'instances' in payload &&
                Array.isArray(payload.instances) &&
                payload.instances.length
            ) {
                commit('setConfigInstances', payload.instances)
            }

            return
        }

        if (payload.hostname) commit('socket/setData', { hostname: payload.hostname })
        if (payload.port) commit('socket/setData', { port: parseInt(payload.port.toString()) })
        if (payload.path) commit('socket/setData', { route_prefix: payload.path })
    },
}
