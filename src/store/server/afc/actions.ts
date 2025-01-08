import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { AFCState, Unit, Lane, Extruder, FilBuffer, Hub } from '@/store/server/afc/types'

export const actions: ActionTree<AFCState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    fetchAFCData({ commit, rootState }) {
        const printer = rootState.printer
        if (!printer || !printer['AFC']) {
            commit('reset')
            return
        }

        const afcData = printer['AFC']
        const units: Unit[] = []
        const mapSet = new Set<string>()
        const laneSet = new Set<string>()
        const extruders: Extruder[] = []

        // Process units
        afcData.units.forEach((unitEntry: string) => {
            const [type, name]: [string, string] = unitEntry.split(' ') as [string, string]
            if (!type || !name) {
                console.error(`Invalid unit entry: ${unitEntry}`)
                return
            }
            const hubData: Hub = printer[`AFC_hub ${name}`] || {}
            const unit: Unit = {
                name: name,
                lanes: [],
                type: type,
                screen: '',
                hub: {
                    name: name,
                    state: hubData.state || false,
                    cut: hubData.cut || false,
                },
            }
            units.push(unit)
        })

        // Process lanes
        afcData.lanes.forEach((laneName: string) => {
            const laneData: any = printer[`AFC_stepper ${laneName}`]
            if (!laneData) {
                console.error(`Missing lane data for: ${laneName}`)
                return
            }
            const bufferData: FilBuffer = printer[`AFC_buffer ${laneData.buffer}`] || {}
            const hubData: Hub = printer[`AFC_hub ${laneData.hub}`] || {}
            if (laneData) {
                const lane: Lane = {
                    name: laneData.name,
                    unit: laneData.unit,
                    buffer: {
                        name: laneData.buffer || '',
                        state: bufferData?.state || false,
                    },
                    hub: {
                        name: laneData.hub,
                        state: hubData.state || false,
                        cut: hubData.cut || false,
                    },
                    lane: laneData.lane || 0,
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
                    laneSet.add(lane.name)
                }
                if (lane.map) {
                    mapSet.add(lane.map)
                }

                // Find the corresponding unit and add the lane
                const unit: Unit | undefined = units.find((u: Unit) => u.name === laneData.unit)
                if (unit) {
                    unit.lanes.push(lane)
                } else {
                    console.error(`Unit not found for lane: ${laneName}`)
                }
            }
        })

        // Process extruders
        afcData.extruders.forEach((extruderName: string) => {
            const extruderData: any = printer[`AFC_extruder ${extruderName}`]
            if (!extruderData) {
                console.error(`Missing extruder data for: ${extruderName}`)
                return
            }
            const bufferData: FilBuffer = printer[`AFC_buffer ${extruderData.buffer}`] || {}
            if (extruderData) {
                const extruder: Extruder = {
                    name: extruderName,
                    ramming: extruderData.tool_start === 'buffer' || false,
                    lane_loaded: extruderData.lane_loaded || '',
                    has_start_sensor: extruderData.tool_start || false,
                    has_end_sensor: extruderData.tool_end || false,
                    tool_start_status: extruderData.tool_start_status || false,
                    tool_end_status: extruderData.tool_end_status || false,
                    buffer: {
                        name: extruderData.buffer || '',
                        state: bufferData?.state || false,
                    },
                }
                extruders.push(extruder)
            }
        })

        // Sort lanes within each unit
        units.forEach((unit) => {
            unit.lanes.sort((a, b) => a.lane - b.lane)
        })

        const laneList = Array.from(laneSet).sort()
        laneList.unshift('NONE')
        const mapList = Array.from(mapSet).sort()

        commit('updateSystem', {
            current_load: afcData.current_load || null,
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
        const unit = state.data.units.find((unit) => unit.lanes.some((lane) => lane.lane === laneName))
        if (unit) {
            const lane = unit.lanes.find((lane) => lane.lane === laneName)
            if (lane) {
                lane.spool = { ...lane.spool, ...spool }
                commit('setUnits', [...state.data.units])
            }
        }
    },
}
