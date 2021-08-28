import {datasetTypes, datasetTypesInPercents} from '@/store/variables'
import {GetterTree} from 'vuex'
import {
    PrinterTempHistoryState,
    PrinterTempHistoryStateSerie,
    PrinterTempHistoryStateSourceEntry
} from '@/store/printer/tempHistory/types'
import {RootState} from '@/store/types'

export const getters: GetterTree<PrinterTempHistoryState, RootState> = {

    getDatasetColor: state => (name: string) => {
        const dataset = state.series.find(element => element.name === name)

        return (dataset && 'lineStyle' in dataset) ? dataset.lineStyle.color : null
    },

    getSeries: state => (name: string) => {
        return state.series.find(element => element.name === name)
    },

    getSerieNames: (state) => (name: string) => {
        const output: string[] = []

        if (state.series.findIndex((serie: PrinterTempHistoryStateSerie) => serie.name === name) !== -1) {
            output.push('temperature')
        }

        state.series.filter((serie: PrinterTempHistoryStateSerie) => serie.name.startsWith(name+'-')).forEach((serie) => {
            output.push(serie.name.substr(name.length + 1))
        })

        return output
    },

    getBoolDisplayPwmAxis: (state, getter) => {
        const legends = getter['getSelectedLegends']

        return Object.keys(legends).find(key => {
            return (
                legends[key] === true && (
                    key.endsWith('-power') ||
                    key.endsWith('-speed')
                )
            )
        }) !== undefined
    },

    getAvg: state => (name: string, serieName: string) => {
        const key = serieName && serieName !== 'temperature' ? name+'-'+serieName : name
        const maxTime = new Date().getTime() - (1000 * 60)
        let value = 0
        let counter = 0

        state.source.filter(data => data.date > maxTime).forEach((item: PrinterTempHistoryStateSourceEntry) => {
            if (key in item) {
                value += item[key]
                counter++
            }
        })

        if (counter && datasetTypesInPercents.includes(serieName)) return (value / counter) * 100
        else if (counter) return (value / counter)

        return 0
    },

    getAvgPower: (state, getters) => (name: string) => {
        return getters['getAvg'](name, 'power')
    },

    getAvgSpeed: (state, getters) => (name: string) => {
        return getters['getAvg'](name, 'speed')
    },

    getSelectedLegends: (state, getters, rootState, rootGetters) => {
        interface legends {
            [key: string]: boolean
        }

        const selected: legends = {}

        if (rootState.printer?.heaters?.available_sensors?.length) {
            rootState.printer?.heaters?.available_sensors.forEach((key: string) => {
                if (rootState.printer && key in rootState?.printer) {
                    let name = key
                    if (key.includes(' ')) name = key.split(' ')[1]

                    datasetTypes.forEach((datasetType: string) => {
                        if (rootState?.printer && rootState?.printer[key] && datasetType in rootState?.printer[key]) {
                            const tmpName = datasetType === 'temperature' ? name : name+'-'+datasetType
                            selected[tmpName] = rootGetters['gui/getDatasetValue']({name: name, type: datasetType})
                        }
                    })
                }
            })
        }

        return selected
    },
}