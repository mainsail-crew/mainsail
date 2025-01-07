import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { AFCState, Unit, Lane } from '@/store/server/afc/types'

export const actions: ActionTree<AFCState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    fetchAFCData({ commit, rootState }) {
        const afcData = rootState.printer?.AFC ? JSON.parse(JSON.stringify(rootState.printer.AFC)) : null

        if (!afcData || !afcData.system || !afcData.system.num_units) {
            commit('reset')
            return
        }

        const units: Unit[] = []
        const mapSet = new Set<string>()
        const laneSet = new Set<string>()

        Object.entries(afcData).forEach(([unitName, unitData]) => {
            if (unitName !== 'system') {
                const lanes: Lane[] = []
                Object.entries(unitData as { [key: string]: any }).forEach(([laneName, laneData]) => {
                    if (laneName !== 'system') {
                        const lane = {
                            ...laneData,
                            unitName,
                            laneName,
                            empty: '#2e2e2e',
                            spool: {
                                material: laneData.material || '',
                                spool_id: laneData.spool_id || '',
                                color: laneData.color || '#000000',
                                weight: laneData.weight || 0,
                            },
                        } as Lane
                        lanes.push(lane)
                        if (lane.prep && lane.load) {
                            laneSet.add(lane.laneName)
                        }
                        if (lane.map) {
                            mapSet.add(lane.map)
                        }
                    }
                })
                const unit: Unit = {
                    system: (unitData as any).system,
                    unitName,
                    lanes,
                }
                units.push(unit)
            }
        })

        const laneList = Array.from(laneSet).sort()
        laneList.unshift('NONE')
        const mapList = Array.from(mapSet).sort()

        commit('updateSystem', afcData.system)
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
