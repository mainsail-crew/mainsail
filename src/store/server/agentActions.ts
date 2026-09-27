import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { MoonrakerAgentEvent, ServerState } from '@/store/server/types'
import { moonrakerAgents } from '@/store/variables'
import { resolveAgentEvent } from '@/plugins/agentEvents'

export const agentActions: ActionTree<ServerState, RootState> = {
    initExtensions({ commit, dispatch }, payload: { agents?: { name: string }[] }) {
        commit(
            'setAgents',
            (payload.agents ?? []).map((agent) => agent.name)
        )
        commit('setAgentsLoaded', true)
        dispatch('initAgents')
    },

    initAgents({ state, dispatch }) {
        moonrakerAgents
            .filter((agent) => state.agents.includes(agent.name))
            .forEach((agent) => dispatch(agent.dispatch, null, { root: true }))
    },

    onAgentConnected({ commit, dispatch }, name: string) {
        commit('addAgent', name)
        dispatch('initAgents')
    },

    onAgentDisconnected({ commit, dispatch }, name: string) {
        commit('removeAgent', name)

        const agent = moonrakerAgents.find((registration) => registration.name === name)
        if (agent?.disconnectDispatch) dispatch(agent.disconnectDispatch, null, { root: true })
    },

    onAgentEvent({ dispatch }, envelope: MoonrakerAgentEvent) {
        const target = resolveAgentEvent(envelope, moonrakerAgents)
        if (target === null) {
            window.console.debug('Dropped event from unknown agent', envelope)
            return
        }

        dispatch(target.action, target.payload, { root: true })
    },

    notifyAgentsKlippyState({ state, dispatch }) {
        moonrakerAgents
            .filter((agent) => agent.klippyDispatch && state.agents.includes(agent.name))
            .forEach((agent) => dispatch(agent.klippyDispatch as string, null, { root: true }))
    },

    refreshAgents() {
        Vue.$socket.emit('server.extensions.list', {}, { action: 'server/initExtensions' })
    },

    resetAgents({ commit, dispatch }) {
        commit('setAgents', [])
        commit('setAgentsLoaded', false)

        moonrakerAgents
            .filter((agent) => agent.resetDispatch)
            .forEach((agent) => dispatch(agent.resetDispatch as string, null, { root: true }))
    },
}
