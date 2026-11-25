import { themeDir, thumbnailBigMin } from '@/store/variables'
import { convertName, escapePath } from '@/plugins/helpers'
import { GetterTree } from 'vuex'
import { FarmPrinterHeater, FarmPrinterState, FarmPrinterTemperature } from '@/store/farm/printer/types'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { RootState } from '@/store/types'

const LOGO_NAME = 'sidebar-logo'
const LOGO_EXTENSIONS = ['gif', 'jpg', 'png', 'svg']
const EXTRUDER_OBJECT = /^extruder\d*$/

const splitExtension = (filename: string): { name: string; extension: string } => {
    const index = filename.lastIndexOf('.')
    if (index === -1) return { name: filename, extension: '' }

    return { name: filename.slice(0, index), extension: filename.slice(index + 1) }
}

const hasTemperature = (heater: FarmPrinterHeater | undefined): heater is { temperature: number; target: number } =>
    heater?.temperature !== undefined && heater?.target !== undefined

/** Remaining seconds, extrapolated from the print duration and the progress (0-1). */
const extrapolateRemaining = (printDuration: number, progress: number): number => {
    if (printDuration <= 0 || progress <= 0) return 0

    return Math.round(printDuration / progress - printDuration)
}

export const getters: GetterTree<FarmPrinterState, RootState> = {
    /** Protocol-relative base url of Moonraker, e.g. `//printer:7125/path` */
    baseUrl: (state): string => {
        const path = state.socket.path.replace(/^\/+|\/+$/g, '')
        const prefix = path.length > 0 ? `/${path}` : ''

        return `//${state.socket.hostname}:${state.socket.port}${prefix}`
    },

    socketUrl: (state, getters): string => `${state.socket.protocol}:${getters.baseUrl}/websocket`,

    /** Url of the web interface (port 80) on the printer host. */
    webUrl: (state): string => `${window.location.protocol}//${state.socket.hostname}`,

    isCurrentPrinter: (state, _getters, rootState): boolean =>
        rootState.socket?.hostname === state.socket.hostname && rootState.socket.port === state.socket.port,

    printerName: (state): string => {
        if (state.mainsail.printername !== '') return state.mainsail.printername

        const port = state.socket.port !== 80 ? `:${state.socket.port}` : ''
        return `${state.socket.hostname}${port}${state.socket.path}`
    },

    logoColor: (state): string => state.mainsail.logoColor,

    currentCamName: (state): string => state.settings.currentCamName ?? 'off',

    isPrinting: (state): boolean => state.data.print_stats?.state === 'printing',

    statusText: (state, getters): string => {
        if (!state.socket.isConnected) return state.socket.isConnecting ? 'Connecting...' : 'Disconnected'
        if (state.klippyState === 'shutdown') return 'Shutdown'
        if (['disconnected', 'error'].includes(state.klippyState)) return 'ERROR'

        const printState = state.data.print_stats?.state
        if (!printState) return 'Unknown'
        if (getters.isPrinting) return `${Math.floor(getters.progress * 100)}% Printing`

        return printState.charAt(0).toUpperCase() + printState.slice(1)
    },

    currentFilename: (state): string => state.data.print_stats?.filename ?? '',

    progress: (state, getters): number => {
        switch (state.mainsail.calcPrintProgress) {
            case 'file-absolute':
                return getters.progressByFileAbsolute
            case 'slicer':
                return getters.progressBySlicer
            case 'filament':
                return getters.progressByFilament
            default:
                return getters.progressByFileRelative
        }
    },

    /** Progress of the file position between the first and the last gcode command (ignores the header/footer). */
    progressByFileRelative: (state, getters): number => {
        const file = state.currentFile
        const position = state.data.virtual_sdcard?.file_position ?? 0
        const start = file?.gcode_start_byte ?? null
        const end = file?.gcode_end_byte ?? null

        if (file?.filename !== state.data.print_stats?.filename || !start || !end) return getters.progressByFileAbsolute
        if (position <= start) return 0
        if (position >= end) return 1

        return (position - start) / (end - start)
    },

    progressByFileAbsolute: (state): number => state.data.virtual_sdcard?.progress ?? 0,

    progressBySlicer: (state): number => state.data.display_status?.progress ?? 0,

    progressByFilament: (state, getters): number => {
        const filamentUsed = state.data.print_stats?.filament_used
        const filamentTotal = state.currentFile?.filament_total ?? null

        if (filamentUsed === undefined || filamentTotal === null) return getters.progressByFileAbsolute
        if (filamentTotal === 0) return 0

        return filamentUsed / filamentTotal
    },

    thumbnailUrl: (state, getters): string | null => {
        const file = state.currentFile
        const thumbnail = file?.thumbnails.find((thumb) => thumb.width >= thumbnailBigMin)
        if (!file || !thumbnail) return null

        const indexLastDir = file.filename.lastIndexOf('/')
        const dir = indexLastDir !== -1 ? `${file.filename.substring(0, indexLastDir)}/` : ''

        return `${getters.baseUrl}/server/files/gcodes/${escapePath(dir)}${escapePath(thumbnail.relative_path)}`
    },

    themeFileUrl:
        (state, getters) =>
        (name: string, extensions: string[]): string | null => {
            const file = state.themeFiles.find((path) => {
                const { name: fileName, extension } = splitExtension(path)
                return fileName === `${themeDir}/${name}` && extensions.includes(extension)
            })
            if (!file) return null

            return `${getters.baseUrl}/server/files/config/${file}`
        },

    logoUrl: (_state, getters): string | null => getters.themeFileUrl(LOGO_NAME, LOGO_EXTENSIONS),

    /** Current temperatures of extruders, bed and chamber. Empty while Klipper is not connected. */
    temperatures: (state): FarmPrinterTemperature[] => {
        if (state.klippyState === 'disconnected') return []

        const output: FarmPrinterTemperature[] = []
        const addHeater = (name: string, heater: FarmPrinterHeater | undefined) => {
            if (!hasTemperature(heater)) return
            output.push({ name: convertName(name), temperature: heater.temperature, target: heater.target })
        }

        Object.keys(state.data)
            .filter((key) => EXTRUDER_OBJECT.test(key))
            .sort()
            .forEach((key) => addHeater(key, state.data[key as `extruder${string}`]))

        addHeater('heater_bed', state.data.heater_bed)
        addHeater('chamber', state.data['temperature_fan chamber'])

        const chamberSensor = state.data['temperature_sensor chamber']?.temperature
        if (chamberSensor !== undefined) {
            output.push({ name: convertName('chamber'), temperature: chamberSensor, target: null })
        }

        return output
    },

    /** Remaining seconds, based on the file progress. */
    estimatedTimeFile: (state, getters): number =>
        extrapolateRemaining(state.data.print_stats?.print_duration ?? 0, getters.progress),

    /** Remaining seconds, based on the used filament. */
    estimatedTimeFilament: (state): number => {
        const filamentUsed = state.data.print_stats?.filament_used ?? 0
        const filamentTotal = state.currentFile?.filament_total ?? 0
        if (filamentUsed <= 0 || filamentTotal <= filamentUsed) return 0

        return extrapolateRemaining(state.data.print_stats?.print_duration ?? 0, filamentUsed / filamentTotal)
    },

    /** Remaining seconds, based on the slicer estimation. */
    estimatedTimeSlicer: (state): number => {
        const printDuration = state.data.print_stats?.print_duration ?? 0
        const estimatedTime = state.currentFile?.estimated_time ?? 0
        if (printDuration <= 0 || estimatedTime <= printDuration) return 0

        return Math.round(estimatedTime - printDuration)
    },

    /** Timestamp (ms) of the estimated print end, averaged over the enabled estimations. 0 if unknown. */
    eta: (state, getters): number => {
        const calcEtaTime = state.mainsail.calcEtaTime
        const estimations = [
            calcEtaTime.includes('file') ? getters.estimatedTimeFile : 0,
            calcEtaTime.includes('filament') ? getters.estimatedTimeFilament : 0,
            calcEtaTime.includes('slicer') ? getters.estimatedTimeSlicer : 0,
        ].filter((time: number) => time > 0)

        if (estimations.length === 0) return 0

        const average = estimations.reduce((sum, time) => sum + time, 0) / estimations.length
        return Date.now() + average * 1000
    },

    webcams: (state): GuiWebcamStateWebcam[] => state.webcams.filter((webcam) => webcam.enabled),
}
