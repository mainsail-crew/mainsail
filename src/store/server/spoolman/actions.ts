import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServerSpoolmanState } from '@/store/server/spoolman/types'

function convertV2response(payload: { error?: { message: string } | null; response: any }) {
    if ((payload.error?.message ?? null) !== null) {
        Vue.$toast.error(payload.error?.message ?? 'unknown spoolman error')
        return null
    }

    // if the response is v2, we need to get the response into the payload
    if ('response' in payload) return payload.response

    return payload
}

export const actions: ActionTree<ServerSpoolmanState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init({ dispatch }) {
        Vue.$socket.emit('server.spoolman.get_spool_id', {}, { action: 'server/spoolman/getActiveSpoolId' })
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/info',
                use_v2_response: true,
            },
            { action: 'server/spoolman/getInfo' }
        )
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/health',
                use_v2_response: true,
            },
            { action: 'server/spoolman/getHealth' }
        )
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/vendor',
                use_v2_response: true,
            },
            { action: 'server/spoolman/getVendors' }
        )

        // Fetch tool_spool_map from status endpoint
        Vue.$socket.emit(
            'server.spoolman.status',
            {},
            { action: 'server/spoolman/getToolSpoolMap' }
        )

        dispatch('socket/addInitModule', 'server/spoolman/getActiveSpoolId', { root: true })
        dispatch('socket/addInitModule', 'server/spoolman/getHealth', { root: true })
        dispatch('socket/addInitModule', 'server/spoolman/getInfo', { root: true })
        dispatch('socket/addInitModule', 'server/spoolman/getVendors', { root: true })

        dispatch('socket/removeInitModule', 'server/spoolman/init', { root: true })

        // init load spools, but don't wait for it to finish
        // this is needed because HappyHare or AFC need this data to display all spool data
        dispatch('refreshSpools')
    },

    getActiveSpoolId({ commit, dispatch }, payload) {
        commit('setActiveSpoolId', payload.spool_id)
        dispatch('socket/removeInitModule', 'server/spoolman/getActiveSpoolId', { root: true })

        // also set active spool to null, if spool_id is 0 or null
        if ([null, 0].includes(payload.spool_id)) {
            commit('setActiveSpool', null)
            return
        }

        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                use_v2_response: true,
                path: `/v1/spool/${payload.spool_id}`,
            },
            { action: 'server/spoolman/getActiveSpool' }
        )
    },

    getActiveSpool({ commit }, payload) {
        if ('requestParams' in payload) delete payload.requestParams
        payload = convertV2response(payload)
        if (payload === null) return

        commit('setActiveSpool', payload)
    },

    getHealth({ commit, dispatch }, payload) {
        delete payload.requestParams
        dispatch('socket/removeInitModule', 'server/spoolman/getHealth', { root: true })

        payload = convertV2response(payload)
        if (payload === null) return

        commit('setHealth', payload.status)
    },

    getInfo({ commit, dispatch }, payload) {
        delete payload.requestParams
        dispatch('socket/removeInitModule', 'server/spoolman/getInfo', { root: true })
        payload = convertV2response(payload)
        if (payload === null) return

        commit('setInfo', payload)
    },

    getVendors({ commit, dispatch }, payload) {
        delete payload.requestParams
        dispatch('socket/removeInitModule', 'server/spoolman/getVendors', { root: true })
        payload = convertV2response(payload)
        if (payload === null) return

        commit(
            'setVendors',
            Object.entries(payload).map((value) => value)
        )
    },

    refreshSpools({ dispatch }) {
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: '/v1/spool',
            },
            { action: 'server/spoolman/getSpools' }
        )

        dispatch('socket/addLoading', 'refreshSpools', { root: true })
    },

    getSpools({ commit, dispatch }, payload) {
        if ('requestParams' in payload) delete payload.requestParams
        dispatch('socket/removeLoading', 'refreshSpools', { root: true })
        payload = convertV2response(payload)
        if (payload === null) return

        const spools = Object.entries(payload).map((value) => value[1])
        commit('setSpools', spools)
    },

    setActiveSpool(_, id: number | null) {
        const params: { spool_id?: number } = {}
        if (id !== null) params['spool_id'] = id

        Vue.$socket.emit('server.spoolman.post_spool_id', params)
    },

    setToolSpool(_, { tool, spool_id }: { tool: number; spool_id: number | null }) {
        const params: { spool_id?: number; tool: number } = { tool }
        if (spool_id !== null) params['spool_id'] = spool_id

        Vue.$socket.emit('server.spoolman.post_spool_id', params)
    },

    getToolSpoolMap({ commit, dispatch }, payload) {
        if ('requestParams' in payload) delete payload.requestParams
        const toolSpoolMap = payload.tool_spool_map
        if (!toolSpoolMap) return

        const parsed: Record<number, number | null> = {}
        for (const [key, value] of Object.entries(toolSpoolMap)) {
            parsed[parseInt(key)] = value as number | null
        }
        commit('setToolSpools', parsed)

        // Fetch spool details for each tool
        for (const [tool, spoolId] of Object.entries(parsed)) {
            if (spoolId === null) {
                commit('setToolSpoolDetail', { tool: parseInt(tool), spool: null })
                continue
            }
            dispatch('fetchToolSpoolDetail', { tool: parseInt(tool), spool_id: spoolId })
        }
    },

    fetchToolSpoolDetail({ commit }, { tool, spool_id }: { tool: number; spool_id: number }) {
        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                use_v2_response: true,
                path: `/v1/spool/${spool_id}`,
            },
            {
                action: 'server/spoolman/getToolSpoolDetail',
                actionPayload: { tool },
            }
        )
    },

    getToolSpoolDetail({ commit }, payload) {
        const tool = payload.tool ?? null
        if (tool === null) return
        delete payload.tool
        if ('requestParams' in payload) delete payload.requestParams

        payload = convertV2response(payload)
        commit('setToolSpoolDetail', { tool, spool: payload })
    },

    handleActiveSpoolSet({ commit, dispatch }, payload) {
        // Handle notify_active_spool_set with tool field
        const tool = payload.tool ?? 0
        const spoolId = payload.spool_id ?? null

        commit('setToolSpool', { tool, spool_id: spoolId })

        if (spoolId !== null) {
            dispatch('fetchToolSpoolDetail', { tool, spool_id: spoolId })
        } else {
            commit('setToolSpoolDetail', { tool, spool: null })
        }

        // Update legacy active_spool_id for tool 0
        if (tool === 0) {
            commit('setActiveSpoolId', spoolId)
            if (spoolId !== null) {
                Vue.$socket.emit(
                    'server.spoolman.proxy',
                    {
                        request_method: 'GET',
                        use_v2_response: true,
                        path: `/v1/spool/${spoolId}`,
                    },
                    { action: 'server/spoolman/getActiveSpool' }
                )
            } else {
                commit('setActiveSpool', null)
            }
        }
    },

    refreshActiveSpool({ state }) {
        if (state.active_spool_id === null) return

        Vue.$socket.emit(
            'server.spoolman.proxy',
            {
                request_method: 'GET',
                path: `/v1/spool/${state.active_spool_id}`,
            },
            { action: 'server/spoolman/getActiveSpool' }
        )
    },
}
