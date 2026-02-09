import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import Vue from 'vue'
import { GuiTempgroupsState, GuiTempgroup, GuiTempgroupSensor } from '@/store/gui/tempgroups/types'

export const mutations: MutationTree<GuiTempgroupsState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setActiveGroup(state, groupId: string | null) {
        state.activeGroupId = groupId
    },

    setShowAllTab(state, show: boolean) {
        state.showAllTab = show
    },

    groupStore(state, payload: { id: string; values: GuiTempgroup }) {
        Vue.set(state.groups, payload.id, payload.values)
    },

    groupUpdate(state, payload: { id: string; values: Partial<GuiTempgroup> }) {
        if (payload.id in state.groups) {
            const group = { ...state.groups[payload.id] }
            Object.assign(group, payload.values)
            Vue.set(state.groups, payload.id, group)
        }
    },

    groupDelete(state, groupId: string) {
        if (groupId in state.groups) {
            Vue.delete(state.groups, groupId)
        }

        if (state.activeGroupId === groupId) {
            state.activeGroupId = null
        }
    },

    addSensorToGroup(state, payload: { id: string; sensor: GuiTempgroupSensor }) {
        const group = state.groups[payload.id]
        if (group) {
            const sensors = [...(group.sensors ?? [])]
            const maxPos = sensors.reduce((max, s) => Math.max(max, s.pos), -1)
            payload.sensor.pos = maxPos + 1
            sensors.push(payload.sensor)

            Vue.set(state.groups[payload.id], 'sensors', sensors)
        }
    },

    updateSensorInGroup(
        state,
        payload: {
            id: string
            sensorName: string
            option: keyof GuiTempgroupSensor
            value: any
        }
    ) {
        const group = state.groups[payload.id]
        if (group) {
            const sensors = [...(group.sensors ?? [])]
            const sensorIndex = sensors.findIndex((s) => s.name === payload.sensorName)
            if (sensorIndex !== -1) {
                const sensor = sensors[sensorIndex]
                // @ts-ignore
                sensor[payload.option] = payload.value
                Vue.set(state.groups[payload.id], 'sensors', sensors)
            }
        }
    },

    removeSensorFromGroup(state, payload: { id: string; sensorName: string }) {
        const group = state.groups[payload.id]
        if (group) {
            const sensors = [...(group.sensors ?? [])]
            const deletedIndex = sensors.findIndex((s) => s.name === payload.sensorName)
            if (deletedIndex !== -1) {
                const oldPos = sensors[deletedIndex].pos
                sensors.splice(deletedIndex, 1)

                sensors
                    .filter((s) => s.pos > oldPos)
                    .forEach((s) => {
                        s.pos = s.pos - 1
                    })
            }

            Vue.set(state.groups[payload.id], 'sensors', sensors)
        }
    },

    reorderSensorsInGroup(state, payload: { id: string; sensors: GuiTempgroupSensor[] }) {
        const group = state.groups[payload.id]
        if (group) {
            const reorderedSensors = payload.sensors.map((s, i) => ({ ...s, pos: i }))
            Vue.set(state.groups[payload.id], 'sensors', reorderedSensors)
        }
    },

    reorderGroups(state, orderedIds: string[]) {
        orderedIds.forEach((id, index) => {
            if (state.groups[id]) {
                Vue.set(state.groups[id], 'position', index)
            }
        })
    },
}
