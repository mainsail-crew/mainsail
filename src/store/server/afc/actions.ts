import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { AFCState, Unit, Lane, Extruder } from '@/store/server/afc/types'

export const actions: ActionTree<AFCState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    fetchAFCData({ commit, rootState }) {
        const printer = rootState.printer
        if (!printer) {
            commit('reset')
            return
        }

        const units: Unit[] = []
        const mapSet = new Set<string>()
        const laneSet = new Set<string>()
        const extruders: Extruder[] = []

        // Process all AFC related keys
        Object.keys(printer).forEach((key) => {
            if (!key.startsWith('AFC_')) return

            const [type, name] = key.substring(4).split(' ')

            switch (type) {
                case 'extruder': {
                    const extruderData = printer[key]
                    extruders.push({
                        name: name,
                        lane_loaded: extruderData.lane_loaded || '',
                        tool_start_sensor: extruderData.tool_start_status || false,
                        tool_end_sensor: extruderData.tool_sensor_after_extruder || false,
                        buffer: { name: extruderData.buffer || '', state: '' },
                    })
                    break
                }

                case 'buffer': {
                    const bufferData = printer[key]
                    const extruder = extruders.find((e) => e.buffer.name === name)
                    if (extruder) {
                        extruder.buffer.state = bufferData.state
                    }
                    break
                }

                case 'hub': {
                    const hubData = printer[key]
                    const unit = units.find((u) => u.unitName === name)
                    if (unit) {
                        unit.hub = {
                            name: name,
                            state: hubData.state,
                            cut: hubData.cut,
                        }
                    }
                    break
                }

                case 'stepper': {
                    const laneData = printer[key]
                    const lane: Lane = {
                        LANE: laneData.lane || 0,
                        unitName: laneData.unit,
                        laneName: laneData.name,
                        map: laneData.map,
                        load: laneData.load,
                        prep: laneData.prep,
                        tool_loaded: laneData.tool_loaded,
                        loaded_to_hub: laneData.loaded_to_hub,
                        runout_lane: laneData.runout_lane || 'NONE',
                        filament_status: laneData.filament_status || '',
                        filament_status_led: laneData.filament_status_led || '',
                        status: laneData.status || '',
                        empty: '#2e2e2e',
                        spool: {
                            material: laneData.material || '',
                            spool_id: laneData.spool_id?.toString() || '',
                            color: laneData.color || '#000000',
                            weight: laneData.weight || 0,
                        },
                    }

                    if (lane.prep && lane.load) {
                        laneSet.add(lane.laneName)
                    }
                    if (lane.map) {
                        mapSet.add(lane.map)
                    }

                    // Find or create unit
                    let unit = units.find((u) => u.unitName === laneData.unit)
                    if (!unit) {
                        const unitData = printer[`AFC_Unit ${laneData.unit}`]
                        unit = {
                            unitName: laneData.unit,
                            lanes: [],
                            system: {
                                type: unitData?.type || 'Box_Turtle',
                                hub_loaded: false,
                                can_cut: false,
                                screen: '',
                            },
                            hub: {
                                name: laneData.unit,
                                state: false,
                                cut: false,
                            },
                        }
                        units.push(unit)
                    }
                    unit.lanes.push(lane)
                    break
                }
            }
        })

        // Sort lanes within each unit
        units.forEach((unit) => {
            unit.lanes.sort((a, b) => a.LANE - b.LANE)
        })

        const laneList = Array.from(laneSet).sort()
        laneList.unshift('NONE')
        const mapList = Array.from(mapSet).sort()

        commit('updateSystem', {
            current_load: null,
            num_units: units.length,
            num_lanes: laneSet.size,
            num_extruders: extruders.length,
            extruders,
        })
        commit('setLaneList', laneList)
        commit('setMapList', mapList)
        commit('setUnits', units)
    },

    setActiveUnit({ commit }, unit: Unit | null) {
        commit('setActiveUnit', unit)
    },

    setActiveLane({ commit }, lane: Lane | null) {
        commit('setActiveLane', lane)
    },

    updateLaneSpoolInfo({ commit, state }, { laneName, spool }) {
        const unit = state.data.units.find((unit) => unit.lanes.some((lane) => lane.laneName === laneName))
        if (unit) {
            const lane = unit.lanes.find((lane) => lane.laneName === laneName)
            if (lane) {
                lane.spool = { ...lane.spool, ...spool }
                commit('setUnits', [...state.data.units])
            }
        }
    },
}
