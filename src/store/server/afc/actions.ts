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
        const buffers: FilBuffer[] = []
        const hubs: Hub[] = []
        const lanes: Lane[] = []

        afcData.buffers.forEach((bufferName: string) => {
            const bufferData: any = printer[`AFC_buffer ${bufferName}`]
            if (bufferData) {
                const buffer: FilBuffer = {
                    name: bufferName,
                    state: bufferData.state || '',
                }

                buffers.push(buffer)
            }
        })

        afcData.hubs.forEach((hubName: string) => {
            const hubData: any = printer[`AFC_hub ${hubName}`]
            if (hubData) {
                const hub: Hub = {
                    name: hubName,
                    state: hubData.state || '',
                    cut: hubData.cut || false,
                }

                hubs.push(hub)
            }
        })

        // Process extruders
        afcData.extruders.forEach((extruderName: string) => {
            const extruderData: any = printer[`AFC_extruder ${extruderName}`]
            if (!extruderData) {
                console.error(`Missing extruder data for: ${extruderName}`)
                return
            }
            if (extruderData) {
                const extruder: Extruder = {
                    name: extruderName,
                    ramming: extruderData.tool_start === 'buffer' || false,
                    lane_loaded: extruderData.lane_loaded || '',
                    has_start_sensor: extruderData.tool_start || false,
                    has_end_sensor: extruderData.tool_end || false,
                    tool_start_status: extruderData.tool_start_status || false,
                    tool_end_status: extruderData.tool_end_status || false,
                }
                extruders.push(extruder)
            }
        })

        // Process units
        afcData.units.forEach((unitEntry: string) => {
            const [type, name]: [string, string] = unitEntry.split(' ') as [string, string]
            if (!type || !name) {
                console.error(`Invalid unit entry: ${unitEntry}`)
                return
            }
            const formattedType = type.replace(/_/g, '')
            const unitData: any = printer[`AFC_${formattedType} ${name}`]
            if (!unitData) {
                console.error(`Missing unit data for: ${type} ${name}`)
                return
            }

            const unit: Unit = {
                name: name,
                lanes: [],
                type: type,
                screen: '',
                hubs: [],
                extruders: [],
                buffers: [],
            }

            unitData.hubs.forEach((hubName: string) => {
                const hub = hubs.find((h) => h.name === hubName)
                if (hub) {
                    unit.hubs.push(hub)
                }
            })

            unitData.extruders.forEach((extruderName: string) => {
                const extruder = extruders.find((e) => e.name === extruderName)
                if (extruder) {
                    unit.extruders.push(extruder)
                }
            })

            unitData.buffers.forEach((bufferName: string) => {
                const buffer = buffers.find((b) => b.name === bufferName)
                if (buffer) {
                    unit.buffers.push(buffer)
                }
            })

            units.push(unit)
        })

        // Process lanes
        afcData.lanes.forEach((laneName: string) => {
            const laneData: any = printer[`AFC_stepper ${laneName}`]
            if (!laneData) {
                console.error(`Missing lane data for: ${laneName}`)
                return
            }
            if (laneData) {
                const tmpLane: Lane = {
                    name: laneData.name,
                    unit: laneData.unit,
                    buffer: buffers.find((b) => b.name === laneData.buffer) || { name: '', state: '' },
                    hub: hubs.find((h) => h.name === laneData.hub) || { name: '', state: false, cut: false },
                    extruder: extruders.find((e) => e.name === laneData.extruder) || {
                        name: '',
                        lane_loaded: '',
                        ramming: false,
                        has_start_sensor: false,
                        has_end_sensor: false,
                        tool_start_status: false,
                        tool_end_status: false,
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

                if (tmpLane.prep && tmpLane.load) {
                    laneSet.add(tmpLane.name)
                }
                if (tmpLane.map) {
                    mapSet.add(tmpLane.map)
                }

                lanes.push(tmpLane)

                // Find the corresponding unit and add the lane
                const unit: Unit | undefined = units.find((u: Unit) => u.name === laneData.unit)
                if (unit) {
                    unit.lanes.push(tmpLane)
                } else {
                    console.error(`Unit not found for lane: ${laneName}`)
                }
            }
        })

        // Sort lanes within each unit
        units.forEach((unit) => {
            unit.lanes.sort((a, b) => a.lane - b.lane)
        })

        const laneList = Array.from(laneSet).sort()
        laneList.unshift('NONE')
        const mapList = Array.from(mapSet).sort()

        commit('setHubs', hubs)
        commit('setBuffers', buffers)
        commit('setExtruders', extruders)
        commit('setLaneList', laneList)
        commit('setMapList', mapList)
        commit('setUnits', units)
        commit('setCurrentLoad', lanes.find((lane) => afcData.current_load === lane.name) || null)
        commit('setCurrentLane', lanes.find((lane) => afcData.current_lane === lane.name) || null)
        commit('setNextLane', lanes.find((lane) => afcData.next_lane === lane.name) || null)
        commit('setCurrentState', afcData.current_state || '')
        commit('setCurrentToolchange', afcData.current_toolchange || 0)
        commit('setNumberToolchange', afcData.number_toolchange || 0)
        commit('setMessage', afcData.message || { type: '', message: '' })
    },
}
