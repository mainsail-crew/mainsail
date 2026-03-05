import { GetterTree } from 'vuex'
import { GuiTempgroupsState, GuiTempgroup } from '@/store/gui/tempgroups/types'
import { RootState } from '@/store/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiTempgroupsState, RootState> = {
    getSortedGroups(state): GuiTempgroup[] {
        return Object.values(state.groups).sort((a, b) => a.position - b.position)
    },

    getActiveGroup(state): GuiTempgroup | null {
        if (!state.activeGroupId) return null
        return state.groups[state.activeGroupId] || null
    },

    getGroup:
        (state) =>
        (id: string): GuiTempgroup | null => {
            return state.groups[id] || null
        },

    getActiveSensorFilter(state): string[] | null {
        if (!state.activeGroupId) return null

        const group = state.groups[state.activeGroupId]
        if (!group) return null

        return group.sensors
            .slice()
            .sort((a, b) => a.pos - b.pos)
            .map((s) => s.name)
    },

    isSensorInAnyGroup:
        (state) =>
        (sensorName: string): boolean => {
            return Object.values(state.groups).some((group) => group.sensors.some((s) => s.name === sensorName))
        },

    getSensorDisplayName:
        (state) =>
        (sensorName: string): string => {
            for (const group of Object.values(state.groups)) {
                const sensor = group.sensors.find((s) => s.name === sensorName)
                if (sensor?.displayName) {
                    return sensor.displayName
                }
            }
            return sensorName
        },

    getUngroupedSensors(state, getters, rootState): string[] {
        const allSensors: string[] = []

        const heaters = rootState.printer?.heaters?.available_heaters || []
        allSensors.push(...heaters)

        const sensors = rootState.printer?.heaters?.available_sensors || []
        sensors.forEach((sensor: string) => {
            if (!allSensors.includes(sensor)) {
                allSensors.push(sensor)
            }
        })

        return allSensors.filter((name) => !getters.isSensorInAnyGroup(name))
    },

    shouldShowTabs(state): boolean {
        return Object.keys(state.groups).length > 0
    },
}
