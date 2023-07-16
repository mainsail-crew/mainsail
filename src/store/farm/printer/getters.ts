import { defaultLogoColor, themeDir, thumbnailBigMin } from '@/store/variables'
import { convertName } from '@/plugins/helpers'
import { GetterTree } from 'vuex'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'

// eslint-disable-next-line
export const getters: GetterTree<FarmPrinterState, any> = {
    getSocketUrl: (state) => {
        return state.socket.protocol + '://' + state.socket.hostname + ':' + state.socket.port + '/websocket'
    },

    getSocketData: (state) => {
        return state.socket
    },

    isCurrentPrinter: (state, getters, rootState) => {
        return rootState.socket.hostname === state.socket.hostname && rootState.socket.port === state.socket.port
    },

    // eslint-disable-next-line
    getSetting: (state) => (name: string, fallback: any) => {
        return state.settings[name] ?? fallback
    },

    getPrinterName: (state) => {
        if (
            'gui' in state.data &&
            'general' in state.data.gui &&
            'printername' in state.data.gui.general &&
            state.data.gui.general.printername !== ''
        )
            return state.data.gui.general.printername

        return state.socket.port !== 80 ? state.socket.hostname + ':' + state.socket.port : state.socket.hostname
    },

    getPrinterSocketState: (state) => {
        return state.socket
    },

    getLogoColor: (state) => {
        return state.data.gui?.uiSettings?.logo ?? defaultLogoColor
    },

    getStatus: (state, getters) => {
        if (!state.socket.isConnected) {
            return state.socket.isConnecting ? 'Connecting...' : 'Disconnected'
        } else if (!state.server.klippy_connected) {
            return 'ERROR'
        } else if (state.data?.print_stats?.state) {
            if (state.data.print_stats.state === 'printing') {
                const percent = getters['getPrintPercent']

                return Math.floor(percent * 100) + '% Printing'
            }

            return state.data.print_stats.state.charAt(0).toUpperCase() + state.data.print_stats.state.slice(1)
        }

        return 'Unknown'
    },

    getCurrentFilename: (state) => {
        return state.data.print_stats?.filename ?? ''
    },

    getPrintPercent: (state, getters) => {
        const type = state.data.gui?.general?.calcPrintProgress ?? 'file-relative'
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
            state.current_file.filename === state.data.print_stats.filename
        ) {
            if (state.data.virtual_sdcard.file_position <= state.current_file.gcode_start_byte) return 0
            if (state.data.virtual_sdcard.file_position >= state.current_file?.gcode_end_byte) return 1

            const currentPosition = state.data.virtual_sdcard.file_position - state.current_file.gcode_start_byte
            const maxPosition = state.current_file.gcode_end_byte - state.current_file.gcode_start_byte

            if (currentPosition > 0 && maxPosition > 0) return (1 / maxPosition) * currentPosition
        }

        return state.data.virtual_sdcard?.progress ?? 0
    },

    getPrintPercentByFilepositionAbsolute: (state) => {
        return state.data.virtual_sdcard?.progress ?? 0
    },

    getPrintPercentBySlicer: (state) => {
        return state.data.display_status?.progress ?? 0
    },

    getPrintPercentByFilament: (state) => {
        const filament_used = state.data.print_stats?.filament_used ?? null
        const filament_total = state.current_file?.filament_total ?? null

        if (filament_used !== null && filament_total !== null) {
            if (filament_total == 0) return 0

            return filament_used / filament_total
        }

        return state.data.virtual_sdcard?.progress ?? 0
    },

    getImage: (state) => {
        if (state.current_file.filename && state.current_file.thumbnails?.length) {
            const indexLastDir = state.current_file.filename.lastIndexOf('/')
            const dir = indexLastDir !== -1 ? state.current_file.filename.substr(0, indexLastDir) + '/' : ''
            const thumbnail = state.current_file.thumbnails.find((thumb) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'relative_path' in thumbnail)
                return (
                    '//' +
                    state.socket.hostname +
                    ':' +
                    state.socket.port +
                    '/server/files/gcodes/' +
                    dir +
                    thumbnail.relative_path
                )
        }

        return '/img/sidebar-background.svg'
    },

    getThemeFileUrl: (state) => (acceptName: string, acceptExtensions: string[]) => {
        const file = state.theme_files.find(
            (element: string) =>
                element.substr(0, element.lastIndexOf('.')) === themeDir + '/' + acceptName &&
                acceptExtensions.includes(element.substr(element.lastIndexOf('.') + 1))
        )

        return file ? '//' + state.socket.hostname + ':' + state.socket.port + '/server/files/config/' + file : null
    },

    getLogo: (state, getters) => {
        const acceptName = 'sidebar-logo'
        const acceptExtensions = ['gif', 'jpg', 'png', 'gif', 'svg']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions)
    },

    getPosition: (state) => {
        if ('toolhead' in state.data && 'position' in state.data.toolhead) return state.data.toolhead.position

        return []
    },

    getPrinterPreview: (state, getters) => {
        if (!state.server.klippy_connected) return []

        const output = []

        Object.keys(state.data)
            .filter((key) => key.startsWith('extruder'))
            .forEach((key) => {
                if (state.data[key]?.temperature !== undefined && state.data[key]?.target !== undefined) {
                    output.push({
                        name: convertName(key),
                        value:
                            state.data[key].temperature?.toFixed(0) + '° / ' + state.data[key].target?.toFixed(0) + '°',
                    })
                }
            })

        if (state.data.heater_bed?.temperature !== undefined && state.data.heater_bed?.target !== undefined) {
            output.push({
                name: convertName('heater_bed'),
                value:
                    state.data.heater_bed.temperature.toFixed(0) +
                    '° / ' +
                    state.data.heater_bed.target.toFixed(0) +
                    '°',
            })
        }

        if (
            state.data['temperature_fan chamber']?.temperature !== undefined &&
            state.data['temperature_fan chamber']?.target !== undefined
        ) {
            output.push({
                name: convertName('chamber'),
                value:
                    state.data['temperature_fan chamber'].temperature.toFixed(0) +
                    '° / ' +
                    state.data['temperature_fan chamber'].target.toFixed(0) +
                    '°',
            })
        }

        if ('temperature_sensor chamber' in state.data) {
            output.push({
                name: convertName('chamber'),
                value: state.data['temperature_sensor chamber'].temperature.toFixed(0) + '°',
            })
        }

        if (
            'print_stats' in state.data &&
            'state' in state.data.print_stats &&
            state.data.print_stats.state === 'printing' &&
            getters['getPrintPercent'] > 0
        ) {
            const eta = new Date(getters.estimated_time_eta)
            const h = eta.getHours() >= 10 ? eta.getHours() : '0' + eta.getHours()
            const m = eta.getMinutes() >= 10 ? eta.getMinutes() : '0' + eta.getMinutes()

            output.push({
                name: 'ETA',
                value: getters.estimated_time_eta > 0 ? h + ':' + m : '--',
                file: getters.estimated_time_file,
                filament: getters.estimated_time_filament,
                slicer: getters.estimated_time_slicer,
                eta: getters.estimated_time_eta,
            })
        }

        return output
    },

    estimated_time_file: (state, getters) => {
        if (state.data.print_stats?.print_duration > 0 && getters.getPrintPercent > 0) {
            return (
                state.data.print_stats.print_duration / getters.getPrintPercent -
                state.data.print_stats.print_duration
            ).toFixed(0)
        }

        return 0
    },

    estimated_time_filament: (state) => {
        if (
            state.data.print_stats?.print_duration &&
            state.data.print_stats?.filament_used &&
            state.current_file.filament_total &&
            state.data.print_stats.filament_used > 0 &&
            state.current_file.filament_total > state.data.print_stats.filament_used
        ) {
            return (
                state.data.print_stats.print_duration /
                    (state.data.print_stats.filament_used / state.current_file.filament_total) -
                state.data.print_stats.print_duration
            ).toFixed(0)
        }

        return 0
    },

    estimated_time_slicer: (state) => {
        if (
            state.data.print_stats &&
            state.data.print_stats?.print_duration &&
            state.current_file?.estimated_time &&
            state.current_file?.estimated_time > state.data.print_stats.print_duration
        ) {
            return (state.current_file.estimated_time - state.data.print_stats.print_duration).toFixed(0)
        }

        return 0
    },

    estimated_time_eta: (state, getters) => {
        let time = 0
        let timeCount = 0
        const boolFileCalc = state.data.gui?.general?.calcEtaTime?.includes('file') ?? true
        const boolFilamentCalc = state.data.gui?.general?.calcEtaTime?.includes('filament') ?? true
        const boolSlicerCalc = state.data.gui?.general?.calcEtaTime?.includes('slicer') ?? true

        if (boolFileCalc && getters.estimated_time_file > 0) {
            time += parseInt(getters.estimated_time_file)
            timeCount++
        }

        if (boolFilamentCalc && getters.estimated_time_filament > 0) {
            time += parseInt(getters.estimated_time_filament)
            timeCount++
        }

        if (boolSlicerCalc && getters.estimated_time_slicer > 0) {
            time += parseInt(getters.estimated_time_slicer)
            timeCount++
        }

        if (time && timeCount) return Date.now() + (time / timeCount) * 1000

        return 0
    },

    getPrinterWebcams: (state) => {
        return state.data.webcams.filter((webcam: GuiWebcamStateWebcam) => webcam.enabled)
    },
}
