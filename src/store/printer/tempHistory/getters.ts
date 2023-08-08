import { datasetTypes, datasetTypesInPercents } from '@/store/variables'
import { GetterTree } from 'vuex'
import {
    PrinterTempHistoryState,
    PrinterTempHistoryStateSerie,
    PrinterTempHistoryStateSourceEntry,
} from '@/store/printer/tempHistory/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<PrinterTempHistoryState, RootState> = {
    getDatasetColor: (_, getters) => (name: string) => {
        const dataset = getters.getSeries(`${name}-temperature`)

        return dataset?.lineStyle?.color ?? null
    },

    getSeries: (state) => (name: string) => {
        return state.series.find((element) => element.name === name)
    },

    getSerieNames: (state) => (name: string) => {
        const output: string[] = []
        const seriesKeys = state.series
            .map((serie: PrinterTempHistoryStateSerie) => serie.name)
            .filter((serieName) => serieName.startsWith(`${name}-`))

        seriesKeys.forEach((seriesKey) => {
            output.push(seriesKey.slice(name.length + 1))
        })

        return output
    },

    getBoolDisplayPwmAxis: (state, getter) => {
        const legends = getter['getSelectedLegends']

        return (
            Object.keys(legends).find((key) => {
                return legends[key] === true && (key.endsWith('-power') || key.endsWith('-speed'))
            }) !== undefined
        )
    },

    getAvg: (state) => (name: string, serieName: string) => {
        const key = serieName && serieName !== 'temperature' ? name + '-' + serieName : name
        const maxTime = new Date().getTime() - 1000 * 60
        let value = 0
        let counter = 0

        state.source
            .filter((data) => data.date > maxTime)
            .forEach((item: PrinterTempHistoryStateSourceEntry) => {
                if (key in item) {
                    value += item[key]
                    counter++
                }
            })

        if (counter && datasetTypesInPercents.includes(serieName)) return (value / counter) * 100
        else if (counter) return value / counter

        return 0
    },

    getAvgPower: (_, getters) => (name: string) => {
        return getters['getAvg'](name, 'power')
    },

    getAvgSpeed: (_, getters) => (name: string) => {
        return getters['getAvg'](name, 'speed')
    },

    getHostMcuSensors: (state, getters, rootState) => {
        const settings = rootState.printer?.configfile?.settings ?? {}
        const available_heaters = rootState.printer?.heaters?.available_heaters ?? []
        const available_sensors = rootState.printer?.heaters?.available_sensors ?? []

        return available_sensors.filter((fullName: string) => {
            // stop when the current sensor is a heater
            if (available_heaters.includes(fullName)) return false
            // stop when the current sensor is a temperature_fan
            if (fullName.startsWith('temperature_fan')) return false

            // get printer settings object from the current sensor
            const settingsObject = settings[fullName.toLowerCase()]
            if (!settingsObject) return false

            // get the sensor type of the current sensor
            const sensor_type = settingsObject.sensor_type ?? ''

            return ['temperature_mcu', 'temperature_host'].includes(sensor_type)
        })
    },

    getSelectedLegends: (state, getters, rootState) => {
        interface legends {
            [key: string]: boolean
        }

        const selected: legends = {}
        const available_sensors = rootState.printer?.heaters?.available_sensors ?? []
        const viewSettings = rootState.gui?.view?.tempchart?.datasetSettings ?? {}

        Object.keys(viewSettings).forEach((key) => {
            // break if this element doesn't exist in available_sensors
            if (!available_sensors.includes(key)) return

            Object.keys(viewSettings[key]).forEach((attrKey) => {
                // break if this element isn't a valid datasetType
                if (!datasetTypes.includes(attrKey)) return

                const serieName = `${key}-${attrKey}`

                // break if serie in tempchart doesn't exist
                if (state.series.findIndex((serie) => serie.name === serieName) === -1) return

                // add to selected
                selected[serieName] = viewSettings[key][attrKey]
            })
        })

        state.series.forEach((serie) => {
            // break if object is already in the selected list
            if (Object.keys(selected).includes(serie.name)) return

            // get datasetType from the serie name
            const datasetType = serie.name.slice(serie.name.lastIndexOf('-') + 1)

            // add default value for this datasetType; all percent series are hidden per default
            selected[serie.name] = !datasetTypesInPercents.includes(datasetType)
        })

        // hide MCU & Host sensors, if the option is set to true
        const hideMcuHostSensors = rootState.gui?.view?.tempchart?.hideMcuHostSensors ?? false
        if (hideMcuHostSensors) {
            const mcuHostSensors = getters.getHostMcuSensors ?? []

            Object.keys(selected)
                .filter((seriesName) => {
                    const datasetName = seriesName.slice(0, seriesName.lastIndexOf('-'))
                    return mcuHostSensors.includes(datasetName)
                })
                .forEach((seriesName) => {
                    selected[seriesName] = false
                })
        }

        return selected
    },

    getTemperatureStoreSize: (state, getters, rootState, rootGetters) => {
        const dataStoreSize = rootGetters['server/getConfig']('data_store', 'temperature_store_size')

        return dataStoreSize ?? 1200
    },
}
