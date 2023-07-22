import {
    colorArray,
    colorChamber,
    colorHeaterBed,
    datasetInterval,
    datasetTypes,
    datasetTypesInPercents,
} from '@/store/variables'
import { ActionTree } from 'vuex'
import {
    PrinterTempHistoryState,
    PrinterTempHistoryStateSerie,
    PrinterTempHistoryStateSourceEntry,
} from '@/store/printer/tempHistory/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<PrinterTempHistoryState, RootState> = {
    reset({ commit, state }) {
        if (state.updateSourceInterval !== null) clearInterval(state.updateSourceInterval)

        commit('reset')
    },

    init({ commit, rootGetters, dispatch }, payload) {
        window.console.debug('init printer/tempHistory')
        dispatch('reset')

        const now = new Date()
        const allHeaters = rootGetters['printer/getAvailableHeaters'] ?? []
        const allSensors = rootGetters['printer/getAvailableSensors'] ?? []
        const maxHistory = rootGetters['printer/tempHistory/getTemperatureStoreSize']

        if (payload !== undefined) {
            if ('requestParams' in payload) delete payload.requestParams

            const objectKeys = Object.keys(payload)
            // eslint-disable-next-line
            const importData: any = {}

            objectKeys.forEach((key: string) => {
                let nameOnly = key
                if (nameOnly.indexOf(' ') !== -1) {
                    nameOnly = nameOnly.substring(nameOnly.indexOf(' ') + 1)
                }

                // break if sensor doesn't exist anymore or start with a _
                if (!allSensors.includes(key) || nameOnly.startsWith('_')) {
                    delete payload[key]
                    return
                }

                const datasetValues = payload[key]
                datasetTypes.forEach((datasetKey) => {
                    if (datasetKey + 's' in datasetValues) {
                        const length = maxHistory - datasetValues[datasetKey + 's'].length
                        datasetValues[datasetKey + 's'] = [
                            ...Array.from({ length }, () => 0),
                            ...datasetValues[datasetKey + 's'],
                        ]
                    }
                })

                importData[key] = { ...datasetValues }
            })

            // add missing heaters/sensors
            allSensors.forEach((key: string) => {
                // break if sensor is already in the cache
                if (key in payload) return

                let nameOnly = key
                let sensorType = key
                const indexOfFirstSpace = key.indexOf(' ')
                if (indexOfFirstSpace !== -1) {
                    nameOnly = key.substring(indexOfFirstSpace + 1)
                    sensorType = key.substring(0, indexOfFirstSpace)
                }

                // break if sensorName starts with a _
                if (nameOnly.startsWith('_')) return

                const addValues: {
                    temperatures: number[]
                    targets?: number[]
                    powers?: number[]
                    speeds?: number[]
                } = {
                    temperatures: Array(maxHistory).fill(0),
                }

                if (allHeaters.includes(key)) {
                    addValues.targets = Array(maxHistory).fill(0)
                    addValues.powers = Array(maxHistory).fill(0)
                } else if (['temperature_fan'].includes(sensorType)) {
                    addValues.targets = Array(maxHistory).fill(0)
                    addValues.speeds = Array(maxHistory).fill(0)
                }

                importData[key] = { ...addValues }
            })

            const tempDataset = []
            for (let i = 0; i < maxHistory; i++) {
                const tmpDataset: PrinterTempHistoryStateSourceEntry = {
                    date: new Date(now.getTime() - 1000 * (maxHistory - i)),
                }

                Object.keys(importData).forEach((objectName) => {
                    datasetTypes.forEach((attrKey) => {
                        const importDatasetName = `${attrKey}s`

                        if (importDatasetName in importData[objectName])
                            tmpDataset[`${objectName}-${attrKey}`] = importData[objectName][importDatasetName][i]
                    })
                })

                tempDataset.push(tmpDataset)
            }

            commit('setInitSource', tempDataset)

            const tempDatasetKeys = Object.keys(tempDataset[0]).filter((tmp) => tmp !== 'date')
            const masterDatasetKeys = tempDatasetKeys
                .filter((name) => name.endsWith('-temperature'))
                .map((name) => name.slice(0, name.length - 12))
                .sort()
            const series: PrinterTempHistoryStateSerie[] = []
            let colorNumber = 0

            masterDatasetKeys.forEach((name: string) => {
                // get color from store (if exists)
                let color = rootGetters['gui/getDatasetValue']({ name: name, type: 'color' })

                // set color if there is no entry in the store
                if (!color) {
                    // set heater_bed color
                    if (name === 'heater_bed') color = colorHeaterBed

                    // set color for chamber elements
                    if (name.endsWith(' chamber')) color = colorChamber

                    // fallback -> get random color from colorArray
                    if (!color) {
                        color = colorArray[colorNumber]
                        colorNumber++
                    }
                }

                const serie: PrinterTempHistoryStateSerie = {
                    id: series.length + 1,
                    color: color,
                    type: 'line',
                    name: `${name}-temperature`,
                    encode: { x: 'date', y: `${name}-temperature` },
                    animation: false,
                    yAxisIndex: 0,
                    lineStyle: {
                        color: color,
                        width: 2,
                        opacity: 0.9,
                    },
                    showSymbol: false,
                    emphasis: {
                        lineStyle: {
                            color: color,
                            width: 2,
                            opacity: 0.9,
                        },
                    },
                }

                // add main serie to series
                series.push(serie)

                datasetTypes.forEach((attrKey) => {
                    // break if datasetTypes is temperature, because its already in the array
                    if (attrKey === 'temperature') return

                    const subName = name + '-' + attrKey

                    // break if datasetType (target, speed, power) doesn't exist
                    if (!tempDatasetKeys.includes(subName)) return

                    // copy serie from temperature and change name
                    // I have to use the JSON copy method, to have no issues with deep attributes
                    const subSerie: PrinterTempHistoryStateSerie = JSON.parse(JSON.stringify(serie))
                    subSerie.id = series.length + 1
                    subSerie.name = subName
                    subSerie.encode.y = subName

                    // change settings for target datasets
                    if (attrKey === 'target') {
                        subSerie.lineStyle.width = 0
                        subSerie.emphasis.lineStyle.width = 0

                        subSerie.areaStyle = {
                            color: color,
                            opacity: 0.1,
                        }

                        subSerie.emphasis.areaStyle = {
                            color: color,
                            opacity: 0.1,
                        }
                    }

                    // change axis & line settings for percent datasets
                    if (datasetTypesInPercents.includes(attrKey)) {
                        subSerie.yAxisIndex = 1

                        subSerie.lineStyle.width = 1.5
                        subSerie.lineStyle.opacity = 0.75
                        subSerie.lineStyle.type = 'dotted'
                        subSerie.emphasis.lineStyle.width = 1.5
                        subSerie.emphasis.lineStyle.opacity = 0.75
                        subSerie.emphasis.lineStyle.type = 'dotted'
                    }

                    // add sub serie to series
                    series.push(subSerie)
                })
            })

            commit('setInitSeries', series)

            const updateSourceInterval = setInterval(() => {
                dispatch('updateSource')
            }, datasetInterval)

            commit('setUpdateSourceInterval', updateSourceInterval)
        }

        dispatch('socket/removeInitModule', 'printer/initTempHistory', { root: true })
    },

    async updateSource({ commit, rootState, rootGetters, state }) {
        /*if (state.timeLastUpdate !== null) {
            const t0 = performance.now()
            window.console.debug('update Source', t0-state.timeLastUpdate)
        }*/

        if (rootState?.printer?.heaters?.available_sensors?.length) {
            const now = new Date()

            if (state.source.length) {
                const lastEntry = state.source[state.source.length - 1]
                const secondsBefore = lastEntry.date.getSeconds()
                const secondsAfter = now.getSeconds()
                const diff = now.getTime() - lastEntry.date.getTime()

                if (secondsBefore === secondsAfter && diff < 1000) return
            }

            const data: PrinterTempHistoryStateSourceEntry = {
                date: now,
            }

            rootState.printer.heaters.available_sensors.forEach((name: string) => {
                if (!(rootState.printer && name in rootState.printer)) return
                const printerObject = { ...rootState.printer[name] }

                datasetTypes.forEach((attrKey) => {
                    if (!(attrKey in printerObject)) return

                    let value = Math.round(printerObject[attrKey] * 10) / 10
                    if (datasetTypesInPercents.includes(attrKey))
                        value = Math.round(printerObject[attrKey] * 1000) / 1000

                    data[`${name}-${attrKey}`] = value
                })
            })

            commit('addToSource', {
                data: data,
                maxHistory: rootGetters['printer/tempHistory/getTemperatureStoreSize'],
            })
        }

        //commit('saveLastDate', performance.now())
    },

    setColor({ commit }, payload) {
        commit('setColor', payload)
    },
}
