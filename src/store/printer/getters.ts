import {
    additionalSensors,
    checkKlipperConfigModules,
    opacityHeaterActive,
    opacityHeaterInactive,
} from '@/store/variables'
import { GetterTree } from 'vuex'
import {
    PrinterState,
    PrinterStateBedMesh,
    PrinterStateExtruder,
    PrinterStateExtruderStepper,
    PrinterStateFan,
    PrinterStateFilamentSensors,
    PrinterStateHeater,
    PrinterStateTemperatureFan,
    PrinterStateMiscellaneous,
    PrinterStateMcu,
    PrinterStateMacro,
    PrinterStateTemperatureObject,
    PrinterStateTemperatureSensor,
    PrinterStateToolchangeMacro,
} from '@/store/printer/types'
import { caseInsensitiveSort, formatFrequency, getMacroParams } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import {
    mdiFan,
    mdiFire,
    mdiPrinter3dNozzle,
    mdiPrinter3dNozzleAlert,
    mdiRadiator,
    mdiRadiatorDisabled,
    mdiThermometer,
    mdiThermometerHigh,
    mdiThermometerLow,
} from '@mdi/js'

export const getters: GetterTree<PrinterState, RootState> = {
    getPrintPercent: (state) => {
        if (
            state.current_file?.filename &&
            state.current_file?.gcode_start_byte &&
            state.current_file?.gcode_end_byte &&
            state.current_file.filename === state.print_stats.filename
        ) {
            if (state.virtual_sdcard.file_position <= state.current_file.gcode_start_byte) return 0
            if (state.virtual_sdcard.file_position >= state.current_file.gcode_end_byte) return 1

            const currentPosition = state.virtual_sdcard.file_position - state.current_file.gcode_start_byte
            const maxPosition = state.current_file.gcode_end_byte - state.current_file.gcode_start_byte

            if (currentPosition > 0 && maxPosition > 0) return (1 / maxPosition) * currentPosition
        }

        return state.virtual_sdcard?.progress ?? 0
    },

    getMacros: (state) => {
        const array: PrinterStateMacro[] = []
        const config = state.configfile?.config ?? {}
        const settings = state.configfile?.settings ?? null

        Object.keys(config)
            .filter((prop) => prop.toLowerCase().startsWith('gcode_macro'))
            .forEach((prop) => {
                const name = prop.replace('gcode_macro ', '')
                if (name.startsWith('_')) return

                const propLower = prop.toLowerCase()
                const propSettings = settings[propLower]
                if ('rename_existing' in propSettings) return

                const variables = state[prop] ?? {}

                array.push({
                    name,
                    description: settings[propLower].description ?? null,
                    prop: propSettings,
                    params: getMacroParams(propSettings),
                    variables,
                })
            })

        return caseInsensitiveSort(array, 'name')
    },

    getMacro: (state, getters) => (name: string) => {
        const nameLower = name.toLowerCase()
        return getters['getMacros'].find((macro: PrinterStateMacro) => macro.name.toLowerCase() === nameLower)
    },

    getHeaters: (state, getters, rootState, rootGetters) => {
        const heaters: PrinterStateHeater[] = []
        const colorOff = 'grey darken-2'
        const colorHot = 'grey lighten-5'

        if (state.heaters?.available_heaters) {
            for (const [key, value] of Object.entries(state)) {
                if (state.heaters.available_heaters.includes(key)) {
                    let name = key
                    const nameSplit = key.split(' ')

                    if (nameSplit.length > 1 && nameSplit[0] === 'heater_generic') name = nameSplit[1]

                    let icon = mdiPrinter3dNozzleAlert
                    let color = colorOff
                    if (value.target) color = colorHot

                    if (nameSplit[0].startsWith('extruder')) {
                        const min_extrude_temp =
                            key in state.configfile.config && 'min_extrude_temp' in state.configfile.config[key]
                                ? parseFloat(state.configfile.config[key].min_extrude_temp)
                                : 170
                        if (value.temperature >= min_extrude_temp) icon = mdiPrinter3dNozzle
                    } else if (nameSplit[0] === 'heater_bed') {
                        icon = mdiRadiatorDisabled
                        if (value.temperature > 50 || (value.target && value.temperature > value.target - 5))
                            icon = mdiRadiator
                    } else if (nameSplit[0].startsWith('heater_generic')) icon = mdiFire

                    if (!name.startsWith('_')) {
                        heaters.push({
                            name: name,
                            type: nameSplit[0] as PrinterStateHeater['type'],
                            icon: icon,
                            iconColor: color,
                            target: Math.round(value.target * 10) / 10,
                            temperature: Math.round(value.temperature * 10) / 10,
                            additionSensors: getters.getAdditionSensors(nameSplit[1]),
                            power: Math.round((value.power ?? 0) * 100),
                            avgPower: Math.round(getters['tempHistory/getAvgPower'](name) ?? 0),
                            presets: rootGetters['gui/presets/getPresetsFromHeater']({ name: key }),
                            chartColor: getters['tempHistory/getDatasetColor'](name),
                            chartSeries: getters['tempHistory/getSerieNames'](name),
                            min_temp: parseInt(state.configfile?.config[key]?.min_temp ?? 0),
                            max_temp: parseInt(state.configfile?.config[key]?.max_temp ?? 0),
                        })
                    }
                }
            }
        }

        return caseInsensitiveSort(heaters, 'name')
    },

    getTemperatureFans: (state, getters, rootState, rootGetters) => {
        const fans: PrinterStateTemperatureFan[] = []

        for (const [key, value] of Object.entries(state)) {
            const nameSplit = key.split(' ')

            if (nameSplit[0] === 'temperature_fan' && !nameSplit[1].startsWith('_')) {
                fans.push({
                    name: nameSplit[1],
                    icon: mdiFan,
                    target: Math.round(value.target * 10) / 10,
                    temperature: Math.round(value.temperature * 10) / 10,
                    additionSensors: getters.getAdditionSensors(nameSplit[1]),
                    speed: Math.round((value.speed ?? 0) * 100),
                    avgSpeed: Math.round(getters['tempHistory/getAvgSpeed'](name) ?? 0),
                    rpm: value.rpm !== null ? Math.round(value.rpm) : null,
                    presets: rootGetters['gui/presets/getPresetsFromHeater']({ name: key }),
                    chartColor: getters['tempHistory/getDatasetColor'](nameSplit[1]),
                    chartSeries: getters['tempHistory/getSerieNames'](nameSplit[1]),
                    min_temp: parseInt(state.configfile?.config[key]?.min_temp ?? 0),
                    max_temp: parseInt(state.configfile?.config[key]?.max_temp ?? 0),
                })
            }
        }

        return caseInsensitiveSort(fans, 'name')
    },

    getTemperatureSensors: (state, getters) => {
        const sensors: PrinterStateTemperatureSensor[] = []

        for (const [key, value] of Object.entries(state)) {
            const nameSplit = key.split(' ')

            if (nameSplit[0] === 'temperature_sensor' && !nameSplit[1].startsWith('_')) {
                let icon = mdiThermometer
                const min_temp = state.configfile?.settings[key]?.min_temp ?? 0
                const max_temp = state.configfile?.settings[key]?.max_temp ?? 210
                const split = (max_temp - min_temp) / 3

                if (value.temperature <= min_temp + split) icon = mdiThermometerLow
                if (value.temperature >= max_temp - split) icon = mdiThermometerHigh

                sensors.push({
                    name: nameSplit[1],
                    temperature: Math.round(value.temperature * 10) / 10,
                    additionSensors: getters.getAdditionSensors(nameSplit[1]),
                    icon: icon,
                    min_temp: min_temp,
                    max_temp: max_temp,
                    measured_min_temp: Math.round(value.measured_min_temp * 10) / 10,
                    measured_max_temp: Math.round(value.measured_max_temp * 10) / 10,
                    chartColor: getters['tempHistory/getDatasetColor'](nameSplit[1]),
                    chartSeries: getters['tempHistory/getSerieNames'](nameSplit[1]),
                })
            }
        }

        return caseInsensitiveSort(sensors, 'name')
    },

    getTemperatureObjects: (state, getters) => {
        const objects: PrinterStateTemperatureObject[] = []

        const heaters = getters['getHeaters']
        if (heaters.length) {
            heaters.forEach((heater: PrinterStateHeater) => {
                objects.push({
                    name: heater.name,
                    type: heater.type,
                    icon: heater.icon,
                    iconColor:
                        heater.target > 0
                            ? `${heater.chartColor}${opacityHeaterActive}`
                            : `${heater.chartColor}${opacityHeaterInactive}`,
                    iconClass: '',
                    state: heater.target > 0 ? heater.power + '%' : 'off',
                    avgState: heater.avgPower + '%',
                    temperature: heater.temperature,
                    additionSensors: heater.additionSensors,
                    target: heater.target,
                    presets: heater.presets,
                    min_temp: heater.min_temp,
                    max_temp: heater.max_temp,
                    measured_min_temp: null,
                    measured_max_temp: null,
                    rpm: null,
                    rpmClass: '',
                    command: 'SET_HEATER_TEMPERATURE',
                    commandAttributeName: 'HEATER',
                    chartColor: heater.chartColor,
                    chartSeries: heater.chartSeries,
                })
            })
        }

        const temperature_fans = getters['getTemperatureFans']
        if (temperature_fans.length) {
            temperature_fans.forEach((fan: PrinterStateTemperatureFan) => {
                objects.push({
                    name: fan.name,
                    type: 'temperature_fan',
                    icon: fan.icon,
                    iconColor:
                        fan.target > 0
                            ? `${fan.chartColor}${opacityHeaterActive}`
                            : `${fan.chartColor}${opacityHeaterInactive}`,
                    iconClass: fan.speed ? ' icon-rotate' : '',
                    state: fan.target > 0 && fan.speed > 0 ? fan.speed + '%' : fan.target > 0 ? 'standby' : 'off',
                    avgState: fan.avgSpeed + '%',
                    temperature: fan.temperature,
                    additionSensors: fan.additionSensors,
                    target: fan.target,
                    presets: fan.presets,
                    min_temp: fan.min_temp,
                    max_temp: fan.max_temp,
                    measured_min_temp: null,
                    measured_max_temp: null,
                    rpm: fan.rpm,
                    rpmClass: fan.rpm === 0 && fan.speed > 0 ? 'red--text' : '',
                    command: 'SET_TEMPERATURE_FAN_TARGET',
                    commandAttributeName: 'TEMPERATURE_FAN',
                    chartColor: fan.chartColor,
                    chartSeries: fan.chartSeries,
                })
            })
        }

        const temperature_sensors = getters['getTemperatureSensors']
        if (temperature_sensors.length) {
            temperature_sensors.forEach((sensor: PrinterStateTemperatureSensor) => {
                objects.push({
                    name: sensor.name,
                    type: 'temperature_sensor',
                    icon: sensor.icon,
                    iconColor: `${sensor.chartColor}${opacityHeaterActive}`,
                    iconClass: '',
                    state: null,
                    avgState: '',
                    temperature: sensor.temperature,
                    additionSensors: sensor.additionSensors,
                    target: null,
                    presets: [],
                    min_temp: sensor.min_temp,
                    max_temp: sensor.max_temp,
                    measured_min_temp: sensor.measured_min_temp,
                    measured_max_temp: sensor.measured_max_temp,
                    rpm: null,
                    rpmClass: '',
                    command: null,
                    commandAttributeName: null,
                    chartColor: sensor.chartColor,
                    chartSeries: sensor.chartSeries,
                })
            })
        }

        return objects
    },

    getPartFanSpeed: (state) => {
        return 'fan' in state ? state.fan.speed : 0
    },

    getFans: (state) => {
        const fans: PrinterStateFan[] = []
        const supportedFans = ['temperature_fan', 'controller_fan', 'heater_fan', 'fan_generic', 'fan']

        const controllableFans = ['fan_generic', 'fan']

        for (const [key, value] of Object.entries(state)) {
            const nameSplit = key.split(' ')

            if (supportedFans.includes(nameSplit[0])) {
                const name = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]

                fans.push({
                    name: name,
                    type: nameSplit[0],
                    speed: 'speed' in value ? value.speed : 0,
                    controllable: controllableFans.includes(nameSplit[0]),
                })
            }
        }

        return fans.sort((a, b) => {
            if (a.controllable < b.controllable) return 1
            if (a.controllable > b.controllable) return -1

            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()

            if (nameA < nameB) return -1
            if (nameA > nameB) return 1

            return 0
        })
    },

    getMiscellaneous: (state) => {
        const output: PrinterStateMiscellaneous[] = []
        const supportedObjects = ['controller_fan', 'heater_fan', 'fan_generic', 'fan', 'output_pin']

        const controllableFans = ['fan_generic', 'fan']

        for (const [key, value] of Object.entries(state)) {
            const nameSplit = key.split(' ')

            if (supportedObjects.includes(nameSplit[0])) {
                const name = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]
                if (!name.startsWith('_')) {
                    let controllable = controllableFans.includes(nameSplit[0].toLowerCase())
                    const settings = state.configfile?.settings[key.toLowerCase()] ?? {}
                    const power = 'speed' in value ? value.speed : 'value' in value ? value.value : 0
                    const rpm = 'rpm' in value ? value.rpm : false
                    let pwm = controllable
                    let scale = 1

                    if (nameSplit[0].toLowerCase() === 'fan') scale = 255

                    if (nameSplit[0].toLowerCase() === 'output_pin') {
                        controllable = true
                        pwm = false
                        if ('pwm' in settings) pwm = settings?.pwm ?? false
                        if ('scale' in settings) scale = settings?.scale ?? 1
                    }

                    const tmp = {
                        name: name,
                        type: nameSplit[0],
                        power: power,
                        controllable: controllable,
                        pwm: pwm,
                        rpm: rpm,
                        scale: scale,
                        object: value,
                        config: settings,
                        off_below: undefined,
                        max_power: undefined,
                    }

                    if (
                        'configfile' in state &&
                        'settings' in state.configfile &&
                        key.toLowerCase() in state.configfile.settings
                    ) {
                        if ('off_below' in settings) tmp.off_below = settings?.off_below ?? 0
                        if ('max_power' in settings) tmp.max_power = settings?.max_power ?? 1
                    }

                    output.push(tmp)
                }
            }
        }

        return output.sort((a, b) => {
            if (a.type === 'fan') return -1
            if (b.type === 'fan') return 1

            if (a.pwm < b.pwm) return 1
            if (a.pwm > b.pwm) return -1

            if (a.controllable < b.controllable) return 1
            if (a.controllable > b.controllable) return -1

            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()

            if (nameA < nameB) return -1
            if (nameA > nameB) return 1

            return 0
        })
    },

    getAdditionSensors: (state, getters, rootState, rootGetters) => (name: string) => {
        let additionValues = {}
        additionalSensors.forEach((sensorName) => {
            if (sensorName + ' ' + name in state) {
                Object.keys(state[sensorName + ' ' + name]).forEach((key) => {
                    if (key !== 'temperature') {
                        // eslint-disable-next-line
                        const tmp: any = {}
                        tmp[key] = {}
                        tmp[key]['value'] = state[sensorName + ' ' + name][key].toFixed(1)
                        tmp[key]['bool'] = rootGetters['gui/getDatasetAdditionalSensorValue']({
                            name: name,
                            sensor: key,
                        })

                        switch (key) {
                            case 'pressure':
                                tmp[key]['unit'] = 'hPa'
                                break

                            case 'humidity':
                                tmp[key]['unit'] = '%'
                                break

                            default:
                                tmp[key]['unit'] = ''
                        }

                        additionValues = Object.assign(additionValues, tmp)
                    }
                })
            }
        })

        return additionValues
    },

    getAvailableHeaters: (state) => {
        return state.heaters?.available_heaters ?? []
    },

    getAvailableSensors: (state) => {
        return state.heaters?.available_sensors ?? []
    },

    getFilamentSensors: (state) => {
        const sensorObjectNames = ['filament_switch_sensor', 'filament_motion_sensor']
        const sensors: PrinterStateFilamentSensors[] = []

        for (const [key, value] of Object.entries(state)) {
            const nameSplit = key.split(' ')

            if (sensorObjectNames.includes(nameSplit[0])) {
                sensors.push({
                    name: nameSplit[1],
                    enabled: value.enabled,
                    filament_detected: value.filament_detected,
                })
            }
        }

        return caseInsensitiveSort(sensors, 'name')
    },

    getMcus: (state, getters): PrinterStateMcu[] => {
        const mcus: PrinterStateMcu[] = []

        Object.keys(state).forEach((key) => {
            if (key === 'mcu' || key.startsWith('mcu ')) {
                const mcu = state[key]
                const versionOutput = (mcu.mcu_version ?? 'unknown').split('-').slice(0, 4).join('-')

                let load = 0
                if (mcu.last_stats?.mcu_task_avg && mcu.last_stats?.mcu_task_stddev) {
                    load = mcu.last_stats.mcu_task_avg + (3 * mcu.last_stats?.mcu_task_stddev) / 0.0025
                }

                let loadProgressColor = 'primary'
                if (load > 0.95) loadProgressColor = 'error'
                else if (load > 0.8) loadProgressColor = 'warning'

                mcus.push({
                    name: key,
                    mcu_constants: mcu.mcu_constants,
                    last_stats: mcu.last_stats,
                    version: versionOutput,
                    chip: mcu.mcu_constants?.MCU ?? null,
                    freq: mcu.last_stats?.freq ?? null,
                    freqFormat: formatFrequency(mcu.last_stats?.freq ?? 0),
                    awake: ((mcu.last_stats?.mcu_awake ?? 0) / 5).toFixed(2),
                    load: load.toFixed(2),
                    loadPercent: load < 1 ? Math.round(load * 100) : 100,
                    loadProgressColor: loadProgressColor,
                    tempSensor: getters.getMcuTempSensor(key),
                })
            }
        })

        return mcus
    },

    getPrinterObject: (state) => (objectName: string) => {
        if (objectName in state) return state[objectName]

        return null
    },

    getPrinterConfigObjects: (state) => (objectNames: string[]) => {
        // eslint-disable-next-line
        const output: any = {}

        if (state.configfile?.settings) {
            Object.keys(state.configfile.settings).forEach((key) => {
                const keySplits = key.split(' ')

                if (objectNames.includes(keySplits[0])) {
                    output[key] = state.configfile.settings[key]
                }
            })
        }

        return output
    },

    getHostTempSensor: (state, getters) => {
        const sensorTypes = ['rpi_temperature', 'temperature_host']
        const checkObjects = ['temperature_sensor', 'temperature_fan']
        let output: null | { temperature: number; measured_min_temp: number; measured_max_temp: number } = null

        const objects = getters.getPrinterConfigObjects(checkObjects)
        Object.keys(objects).forEach((key) => {
            const settings = objects[key]
            const caseKey: string =
                Object.keys(state).find((state_key: string) => state_key.toLowerCase() === key.toLowerCase()) || ''
            if ('sensor_type' in settings && sensorTypes.includes(settings.sensor_type) && caseKey in state) {
                const value = state[caseKey]

                output = {
                    temperature: value.temperature?.toFixed(0),
                    measured_min_temp: value.measured_min_temp?.toFixed(1),
                    measured_max_temp: value.measured_max_temp?.toFixed(1),
                }
            }
        })

        return output
    },

    getMcuTempSensors: (state, getters) => {
        const checkObjects = ['temperature_sensor', 'temperature_fan']
        // eslint-disable-next-line
        const output: { key: string; settings: any; object: any }[] = []

        const objects = getters.getPrinterConfigObjects(checkObjects)
        Object.keys(objects).forEach((key) => {
            const value = objects[key]
            const caseKey: string =
                Object.keys(state).find((state_key: string) => state_key.toLowerCase() === key.toLowerCase()) || ''

            if ('sensor_type' in value && value.sensor_type === 'temperature_mcu' && 'sensor_mcu' in value) {
                output.push({
                    key: caseKey,
                    settings: value,
                    object: caseKey in state ? state[caseKey] : {},
                })
            }
        })

        return output
    },

    getMcuTempSensor: (state, getters) => (mcuName: string) => {
        interface McuTempSensor {
            temperature: number
            measured_min_temp: number | null
            measured_max_temp: number | null
        }

        let output: McuTempSensor | null = null

        const sensors = getters.getMcuTempSensors
        // eslint-disable-next-line
        sensors.forEach((sensor: { key: string; settings: any; object: any }) => {
            if (sensor.settings?.sensor_mcu === mcuName && sensor.object?.temperature) {
                output = {
                    temperature: sensor.object.temperature.toFixed(0),
                    measured_min_temp: sensor.object.measured_min_temp?.toFixed(1) ?? null,
                    measured_max_temp: sensor.object.measured_max_temp?.toFixed(1) ?? null,
                }
            }
        })

        return output
    },

    getBedMeshProfiles: (state) => {
        const profiles: PrinterStateBedMesh[] = []
        let currentProfile = ''
        if (state.bed_mesh) currentProfile = state.bed_mesh.profile_name

        if (state.bed_mesh && 'profiles' in state.bed_mesh) {
            Object.keys(state.bed_mesh?.profiles).forEach((key) => {
                const value: any = state.bed_mesh.profiles[key]

                let points: number[] = []
                value.points.forEach((row: number[]) => {
                    points = points.concat(row)
                })

                const min = Math.min(...points)
                const max = Math.max(...points)

                profiles.push({
                    name: key,
                    data: { ...value.mesh_params, points: value.points },
                    points: points,
                    min: min,
                    max: max,
                    variance: Math.abs(min - max),
                    is_active: currentProfile === key,
                })
            })
        }

        return caseInsensitiveSort(profiles, 'name')
    },

    getExtruders: (state) => {
        const extruders: PrinterStateExtruder[] = []
        if (state.configfile?.settings) {
            Object.keys(state.configfile?.settings)
                .filter((key) => key.match(/^(extruder)\d?$/g))
                .sort()
                .forEach((key: string) => {
                    const extruder = state.configfile?.settings[key]
                    extruders.push({
                        key: key,
                        name: `Extruder ${key == 'extruder' ? '0' : key.replace('extruder', '')}`,
                        filamentDiameter: extruder.filament_diameter,
                        nozzleDiameter: extruder.nozzle_diameter,
                        minExtrudeTemp: extruder.min_extrude_temp,
                        maxExtrudeOnlyDistance: extruder.max_extrude_only_distance,
                    })
                })
        }
        return extruders
    },

    getExtruderSteppers: (state) => {
        const extruderSteppers: PrinterStateExtruderStepper[] = []
        if (state.configfile?.settings) {
            Object.keys(state.configfile?.settings)
                .filter((key) => key.match(/^extruder_stepper/g))
                .sort()
                .forEach((key: string) => {
                    const extruderStepper = state.configfile?.settings[key]
                    extruderSteppers.push({
                        key: key,
                        name: key.replace('extruder_stepper ', ''),
                        extruder: extruderStepper.extruder,
                    })
                })
        }
        return extruderSteppers
    },

    getExtrudePossible: (state) => {
        const extruderName = state.toolhead?.extruder ?? 'extruder'

        return state[extruderName]?.can_extrude ?? false
    },

    getBedMeshProfileName: (state) => {
        if ('bed_mesh' in state && 'profile_name' in state.bed_mesh) return state.bed_mesh.profile_name

        return ''
    },

    getMaxTemp: (state) => {
        let maxtemp = 0

        state.heaters?.available_sensors?.forEach((sensorName: string) => {
            const settings = state.configfile?.settings[sensorName]
            if (
                settings &&
                'max_temp' in settings &&
                Math.round(settings.max_temp) > maxtemp &&
                Math.round(settings.max_temp) < 10000
            )
                maxtemp = Math.round(settings.max_temp)
        })

        return maxtemp > 0 ? maxtemp + 10 : 300
    },

    existPrinterConfig: (state) => {
        if (state.configfile?.config) return Object.keys(state.configfile.config).length > 0

        return false
    },

    checkConfig: (state) => (configName: string) => {
        if (!state.configfile.config) return false

        const configObjects = Object.keys(state.configfile.config)
        return configObjects.findIndex((module) => module.toLowerCase() === configName.toLowerCase()) !== -1
    },

    checkNecessaryConfig: (state, getters) => {
        const missingModules: string[] = []

        checkKlipperConfigModules.forEach((module: string) => {
            if (!getters.checkConfig(module)) missingModules.push(module)
        })

        if (!getters.checkConfig('display') && !getters.checkConfig('display_status'))
            missingModules.push('display_status')

        return missingModules
    },

    getEstimatedTimeFile: (state, getters) => {
        if (
            'print_stats' in state &&
            'print_duration' in state.print_stats &&
            state.print_stats.print_duration > 0 &&
            getters.getPrintPercent > 0
        ) {
            return (
                state.print_stats.print_duration / getters.getPrintPercent -
                state.print_stats.print_duration
            ).toFixed(0)
        }

        return 0
    },

    getEstimatedTimeFilament: (state) => {
        if (
            'print_stats' in state &&
            'print_duration' in state.print_stats &&
            'filament_used' in state.print_stats &&
            'current_file' in state &&
            'filament_total' in state.current_file &&
            state.print_stats.print_duration > 0 &&
            state.current_file.filament_total > 0 &&
            state.current_file.filament_total > state.print_stats.filament_used
        ) {
            return (
                state.print_stats.print_duration /
                    (state.print_stats.filament_used / state.current_file.filament_total) -
                state.print_stats.print_duration
            ).toFixed(0)
        }

        return 0
    },

    getEstimatedTimeSlicer: (state) => {
        if (
            'print_stats' in state &&
            'print_duration' in state.print_stats &&
            'current_file' in state &&
            'estimated_time' in state.current_file &&
            state.print_stats.print_duration > 0 &&
            state.current_file.estimated_time > 0 &&
            state.current_file.estimated_time > state.print_stats.print_duration
        ) {
            return (state.current_file.estimated_time - state.print_stats.print_duration).toFixed(0)
        }

        return 0
    },

    getEstimatedTimeAvg: (state, getters, rootState) => {
        let time = 0
        let timeCount = 0
        const boolFileCalc = rootState.gui?.general?.calcEstimateTime?.includes('file') ?? false
        const boolFilamentCalc = rootState.gui?.general?.calcEstimateTime?.includes('filament') ?? false

        if (boolFileCalc && getters.getEstimatedTimeFile > 0) {
            time += parseInt(getters.getEstimatedTimeFile)
            timeCount++
        }

        if (boolFilamentCalc && getters.getEstimatedTimeFilament > 0) {
            time += parseInt(getters.getEstimatedTimeFilament)
            timeCount++
        }

        if (time && timeCount) return time / timeCount

        return 0
    },

    getEstimatedTimeETA: (state, getters, rootState) => {
        let time = 0
        let timeCount = 0
        const boolFileCalc = rootState.gui?.general?.calcEtaTime?.includes('file') ?? false
        const boolFilamentCalc = rootState.gui?.general?.calcEtaTime?.includes('filament') ?? false
        const boolSlicerCalc = rootState.gui?.general?.calcEtaTime?.includes('slicer') ?? false

        if (boolFileCalc && getters.getEstimatedTimeFile > 0) {
            time += parseInt(getters.getEstimatedTimeFile)
            timeCount++
        }

        if (boolFilamentCalc && getters.getEstimatedTimeFilament > 0) {
            time += parseInt(getters.getEstimatedTimeFilament)
            timeCount++
        }

        if (boolSlicerCalc && getters.getEstimatedTimeSlicer > 0) {
            time += parseInt(getters.getEstimatedTimeSlicer)
            timeCount++
        }

        if (time && timeCount) return Date.now() + (time / timeCount) * 1000

        return 0
    },

    getToolchangeMacros: (state, getters) => {
        const macros = getters['getMacros']
        const tools: PrinterStateToolchangeMacro[] = []

        macros
            .filter((macro: any) => macro.name.toUpperCase().match(/^T\d+/))
            .forEach((macro: any) =>
                tools.push({
                    name: macro.name,
                    active: macro.variables.active ?? false,
                })
            )

        return tools.sort((a, b) => {
            const numberA = parseInt(a.name.slice(1))
            const numberB = parseInt(b.name.slice(1))

            return numberA - numberB
        })
    },

    getKinematics: (state) => {
        if (!state.configfile?.settings?.printer) return false

        return state.configfile?.settings?.printer.kinematics ?? 'none'
    },

    existsQGL: (state) => {
        if (!state.configfile?.settings) return false

        return 'quad_gantry_level' in state.configfile.settings
    },

    existsZtilt: (state) => {
        if (!state.configfile?.settings) return false

        return 'z_tilt' in state.configfile.settings
    },

    existsBedTilt: (state) => {
        if (!state.configfile?.settings) return false

        return 'bed_tilt' in state.configfile.settings
    },

    existsBedScrews: (state) => {
        if (!state.configfile?.settings) return false

        return 'bed_screws' in state.configfile.settings
    },

    existsDeltaCalibrate: (state) => {
        if (!state.configfile?.settings) return false

        return 'delta_calibrate' in state.configfile.settings
    },

    existsScrewsTilt: (state) => {
        if (!state.configfile?.settings) return false

        return 'screws_tilt_adjust' in state.configfile.settings
    },
}
