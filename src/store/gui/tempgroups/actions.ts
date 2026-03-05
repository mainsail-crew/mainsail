import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { GuiTempgroupsState, GuiTempgroup, GuiTempgroupSensor } from '@/store/gui/tempgroups/types'

export const actions: ActionTree<GuiTempgroupsState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    saveSetting({ dispatch }, payload: { name: string; value: any }) {
        dispatch(
            'gui/saveSetting',
            {
                name: 'tempgroups.' + payload.name,
                value: payload.value,
            },
            { root: true }
        )
    },

    setActiveGroup({ commit, dispatch }, groupId: string | null) {
        commit('setActiveGroup', groupId)
        dispatch('saveSetting', { name: 'activeGroupId', value: groupId })
    },

    setShowAllTab({ commit, dispatch }, show: boolean) {
        commit('setShowAllTab', show)
        dispatch('saveSetting', { name: 'showAllTab', value: show })
    },

    groupUpload({ state }, id: string) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'tempgroups.groups.' + id,
            value: state.groups[id],
        })
    },

    async groupStore({ commit, state, dispatch }, payload: { values: Partial<GuiTempgroup> }) {
        const id = uuidv4()
        const maxPosition = Object.values(state.groups).reduce((max, g) => Math.max(max, g.position), -1)

        const group: GuiTempgroup = {
            id,
            name: payload.values.name || 'New Group',
            position: maxPosition + 1,
            color: payload.values.color,
            showChart: payload.values.showChart ?? true,
            sensors: payload.values.sensors ?? [],
        }

        commit('groupStore', { id, values: group })
        await dispatch('groupUpload', id)

        return id
    },

    groupUpdate({ commit, dispatch }, payload: { id: string; values: Partial<GuiTempgroup> }) {
        commit('groupUpdate', payload)
        dispatch('groupUpload', payload.id)
    },

    groupDelete({ commit }, id: string) {
        commit('groupDelete', id)
        Vue.$socket.emit('server.database.delete_item', {
            namespace: 'mainsail',
            key: 'tempgroups.groups.' + id,
        })
    },

    addSensorToGroup({ commit, dispatch }, payload: { id: string; sensorName: string; displayName?: string }) {
        const sensor: GuiTempgroupSensor = {
            pos: 0,
            name: payload.sensorName,
            displayName: payload.displayName,
        }

        commit('addSensorToGroup', { id: payload.id, sensor })
        dispatch('groupUpload', payload.id)
    },

    updateSensorInGroup(
        { commit, dispatch },
        payload: {
            id: string
            sensorName: string
            option: keyof GuiTempgroupSensor
            value: any
        }
    ) {
        commit('updateSensorInGroup', payload)
        dispatch('groupUpload', payload.id)
    },

    removeSensorFromGroup({ commit, dispatch }, payload: { id: string; sensorName: string }) {
        commit('removeSensorFromGroup', payload)
        dispatch('groupUpload', payload.id)
    },

    reorderSensorsInGroup({ commit, dispatch }, payload: { id: string; sensors: GuiTempgroupSensor[] }) {
        commit('reorderSensorsInGroup', payload)
        dispatch('groupUpload', payload.id)
    },

    reorderGroups({ commit, dispatch }, orderedIds: string[]) {
        commit('reorderGroups', orderedIds)
        orderedIds.forEach((id) => {
            dispatch('groupUpload', id)
        })
    },
}
