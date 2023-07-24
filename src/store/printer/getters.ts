import { checkKlipperConfigModules } from '@/store/variables'
import { GetterTree } from 'vuex'
import {
    PrinterState,
    PrinterStateBedMesh,
    PrinterStateExtruder,
    PrinterStateExtruderStepper,
    PrinterStateFan,
    PrinterStateFilamentSensors,
    PrinterStateMiscellaneous,
    PrinterStateMcu,
    PrinterStateMacro,
    PrinterStateToolchangeMacro,
    PrinterGetterObject,
    PrinterStateLight,
} from '@/store/printer/types'
import { caseInsensitiveSort, formatFrequency, getMacroParams } from '@/plugins/helpers'
import { RootState } from '@/store/types'

export const getters: GetterTree<PrinterState, RootState> = {
    getPrintPercent: (state, getters, rootState) => {
        const type = rootState?.gui?.general?.calcPrintProgress ?? 'file-relative'
        switch (type) {
            case 'file-relative':
                return getters['getPrintPercentByFilepositionRelative']
            case 'file-absolute':
                return getters['getPrintPercentByFilepositionAbsolute']
            case 'slicer':
                return getters['getPrintPercentBySlicer']
            case 'filament':
                return getters['getPrintPercentByFilament']

            default:
                return getters['getPrintPercentByFilepositionRelative']
        }
    },

    getPrintPercentByFilepositionRelative: (state) => {
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

    getPrintPercentByFilepositionAbsolute: (state) => {
        return state.virtual_sdcard?.progress ?? 0
    },

    getPrintPercentBySlicer: (state) => {
        return state.display_status?.progress ?? 0
    },

    getPrintPercentByFilament: (state) => {
        const filament_used = state.print_stats?.filament_used ?? null
        const filament_total = state.current_file?.filament_total ?? null

        if (filament_used !== null && filament_total !== null) {
            if (filament_total == 0) return 0

            const progress = filament_used / filament_total
            if (progress > 1) return 1

            return progress
        }

        return state.virtual_sdcard?.progress ?? 0
    },

    getPrintMaxLayers: (state) => {
        if ((state.print_stats?.info?.total_layer ?? null) !== null) return state.print_stats.info.total_layer
        if (state.current_file?.layer_count) return state.current_file.layer_count

        if (
            state.current_file?.first_layer_height !== undefined &&
            state.current_file?.layer_height !== undefined &&
            state.current_file?.object_height !== undefined
        ) {
            const max = Math.ceil(
                (state.current_file.object_height - state.current_file.first_layer_height) /
                    state.current_file.layer_height +
                    1
            )
            return max > 0 ? max : 0
        }

        return 0
    },

    getPrintCurrentLayer: (state, getters) => {
        if ((state.print_stats?.info?.current_layer ?? null) !== null) return state.print_stats.info.current_layer

        if (
            state.print_stats?.print_duration > 0 &&
            state.current_file?.first_layer_height !== undefined &&
            state.current_file?.layer_height !== undefined
        ) {
            const gcodePositionZ = state.gcode_move?.gcode_position[2] ?? 0
            const current_layer = Math.ceil(
                (gcodePositionZ - state.current_file.first_layer_height) / state.current_file.layer_height + 1
            )

            if (current_layer > getters.getPrintMaxLayers) return getters.getPrintMaxLayers
            if (current_layer > 0) return current_layer
        }

        return 0
    },

    getPrinterObjects: (state) => (supportedObjects: string[]) => {
        const outputObjects: PrinterGetterObject[] = []

        for (const [key, value] of Object.entries(state)) {
            let type = key.substring(0, key.indexOf(' ')).trimEnd()
            let name = key.substring(key.indexOf(' ') + 1).trimStart()

            if (key.indexOf(' ') === -1) type = name = key

            if (supportedObjects.includes(type)) {
                outputObjects.push({
                    name,
                    type,
                    state: { ...value },
                    config: state.configfile?.config[key] ?? {},
                    settings: state.configfile?.settings[key.toLowerCase()] ?? {},
                })
            }
        }

        return outputObjects
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

    getPartFanSpeed: (state) => {
        return 'fan' in state ? state.fan.speed : 0
    },

    getFans: (state, getters) => {
        const fans: PrinterStateFan[] = []
        const supportedFans = ['temperature_fan', 'controller_fan', 'heater_fan', 'fan_generic', 'fan']
        const objects = getters.getPrinterObjects(supportedFans)

        const controllableFans = ['fan_generic', 'fan']

        objects.foreach((object: PrinterGetterObject) => {
            fans.push({
                name: object.name,
                type: object.type,
                speed: object.state.speed ?? 0,
                controllable: controllableFans.includes(object.type),
            })
        })

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

    getLights: (state, getters) => {
        const lights: PrinterStateLight[] = []
        const supportedObjects = ['dotstar', 'led', 'neopixel', 'pca9533', 'pca9632']
        const objects = getters.getPrinterObjects(supportedObjects)

        objects
            .filter((object: PrinterGetterObject) => {
                return !object.name.startsWith('_')
            })
            .forEach((object: PrinterGetterObject) => {
                let colorOrder = 'RGB'
                let singleChannelTarget = null
                const colorData = object.state.color_data ?? []

                if ('color_order' in object.settings) colorOrder = object.settings.color_order[0] ?? ''

                if (object.type === 'led') {
                    colorOrder = ''
                    if ('red_pin' in object.config) colorOrder += 'R'
                    if ('green_pin' in object.config) colorOrder += 'G'
                    if ('blue_pin' in object.config) colorOrder += 'B'
                    if ('white_pin' in object.config) colorOrder += 'W'
                }

                let initialRed = object.settings.initial_red ?? null
                if (!('initial_red' in object.config)) initialRed = null

                let initialGreen = object.settings.initial_green ?? null
                if (!('initial_green' in object.config)) initialGreen = null

                let initialBlue = object.settings.initial_blue ?? null
                if (!('initial_blue' in object.config)) initialBlue = null

                let initialWhite = object.settings.initial_white ?? null
                if (!('initial_white' in object.config)) initialWhite = null

                if (object.type === 'led' && colorOrder.length === 1) {
                    const firstColorData = colorData[0] ?? []

                    switch (colorOrder) {
                        case 'R':
                            singleChannelTarget = firstColorData[0] ?? 0
                            break
                        case 'G':
                            singleChannelTarget = firstColorData[1] ?? 0
                            break
                        case 'B':
                            singleChannelTarget = firstColorData[2] ?? 0
                            break
                        case 'W':
                            singleChannelTarget = firstColorData[3] ?? 0
                            break
                    }
                }

                lights.push({
                    name: object.name,
                    type: object.type as PrinterStateLight['type'],
                    chainCount: object.settings.chain_count ?? 1,
                    colorOrder,
                    initialRed,
                    initialGreen,
                    initialBlue,
                    initialWhite,
                    colorData,
                    singleChannelTarget,
                })
            })

        return lights.sort((a, b) => {
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
                    const rpm = 'rpm' in value ? value.rpm : null
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
                        power,
                        controllable,
                        pwm,
                        rpm,
                        scale,
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
            if (mcuName.endsWith(sensor.settings?.sensor_mcu) && sensor.object?.temperature) {
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
            state.current_file.estimated_time > 0
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

    getEstimatedTimeETAFormat: (state, getters, rootState, rootGetters) => {
        const hours12Format = rootGetters['gui/getHours12Format'] ?? false
        const eta = getters['getEstimatedTimeETA']
        if (eta === 0) return '--'

        const date = new Date(eta)
        let am = true
        let h: string | number = date.getHours()

        if (hours12Format && h > 11) am = false
        if (hours12Format && h > 12) h -= 12
        if (h < 10) h = '0' + h

        const m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()

        const diff = eta - new Date().getTime()
        let output = h + ':' + m
        if (hours12Format) output += ` ${am ? 'AM' : 'PM'}`
        if (diff > 60 * 60 * 24 * 1000) output += `+${Math.trunc(diff / (60 * 60 * 24 * 1000))}`

        return output
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
                    color: macro.variables.color ?? macro.variables.colour ?? null,
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

    existsFirmwareRetraction: (state) => {
        if (!state.configfile?.settings) return false

        return 'firmware_retraction' in state.configfile.settings
    },
}
