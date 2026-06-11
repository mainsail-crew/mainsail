import { computed } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { DateTimeOptions } from 'vue-i18n'
import { ServerPowerStateDevice } from '@/store/server/power/types'

export function useBase() {
    const store = useStore()
    const display = useDisplay()

    const apiUrl = computed(() => store.getters['socket/getUrl'])

    const hostUrl = computed(() => store.getters['socket/getHostUrl'])

    const hostPort = computed(() => parseInt(store.state.socket.port ?? 80))

    const instancesDB = computed(() => store.state.instancesDB ?? 'moonraker')

    const socketIsConnected = computed(() => store.state.socket.isConnected ?? false)

    const guiIsReady = computed(() => store.state.socket.initializationList.length === 0)

    const klippyIsConnected = computed(() => store.state.server.klippy_connected ?? false)

    const klipperState = computed(() => {
        if (!klippyIsConnected.value) return 'disconnected'
        return store.state.server.klippy_state ?? ''
    })

    const klipperReadyForGui = computed(() => socketIsConnected.value && klipperState.value === 'ready')

    const klipperAppName = computed(() => store.state.printer.app_name ?? 'Klipper')

    const printerIsPrinting = computed(
        () => klipperReadyForGui.value && ['printing', 'paused'].includes(printer_state.value)
    )

    const printerIsPrintingOnly = computed(
        () => klipperReadyForGui.value && printer_state.value === 'printing'
    )

    const printerPowerDevice = computed(() => {
        const deviceName = store.state.gui.uiSettings.powerDeviceName ?? null
        if (deviceName !== null) return deviceName
        const devices = store.getters['server/power/getDevices'] ?? []
        return (
            devices.find((device: ServerPowerStateDevice) => device.device.toLowerCase() === 'printer')
                ?.device ?? 'printer'
        )
    })

    const isPrinterPowerOff = computed(() => {
        const devices = store.getters['server/power/getDevices'] ?? []
        if (devices.length === 0) return false
        const deviceIndex = devices.findIndex(
            (device: ServerPowerStateDevice) => device.device === printerPowerDevice.value
        )
        if (deviceIndex === -1) return false
        const device = devices[deviceIndex]
        if (device.status !== 'off') return false
        return !klippyIsConnected.value
    })

    const loadings = computed(() => store.state.socket.loadings ?? [])

    const printer_state = computed(() => {
        const printer_state =
            store.state.printer.print_stats?.state ?? store.state.printer.idle_timeout?.state ?? ''
        const timelapse_pause =
            store.state.printer['gcode_macro TIMELAPSE_TAKE_FRAME']?.is_paused ?? false
        return printer_state === 'paused' && timelapse_pause ? 'printing' : printer_state
    })

    const isMobile = computed(() => display.mobile.value)

    const isTablet = computed(() => display.smAndUp.value && !isDesktop.value && !isWidescreen.value)

    const isDesktop = computed(() => display.lgAndUp.value && !isWidescreen.value)

    const isWidescreen = computed(() => display.xl.value)

    const viewport = computed(() => {
        if (isMobile.value) return 'mobile'
        else if (isTablet.value) return 'tablet'
        else if (isDesktop.value) return 'desktop'
        else return 'widescreen'
    })

    const isTouchDevice = computed(() => {
        return (
            'ontouchstart' in window ||
            (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints !== 256)
        )
    })

    const isIOS = computed(() => {
        return !!(
            navigator.userAgent.match(/(iPad|iPhone|iPod)/) ||
            (navigator.platform === 'MacIntel' && 'standalone' in navigator)
        )
    })

    const moonrakerComponents = computed(() => store.state.server?.components ?? [])

    const existGcodesRootDirectory = computed(() => {
        const roots = store.state.server.registered_directories
        return roots.findIndex((root: string) => root === 'gcodes') >= 0
    })

    const spoolManagerUrl = computed(() => {
        const baseurl = store.state.server.config.config?.spoolman?.server ?? undefined
        if (!baseurl) return undefined
        try {
            const url = new URL(baseurl)
            if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
                url.hostname = store.state.socket.hostname
            }
            return url.toString()
        } catch {
            window.console.warn('[Spoolman]: SpoolManager URL is invalid:', baseurl)
            return undefined
        }
    })

    const formatTimeOptions = computed<DateTimeOptions>(() => {
        const format = store.state.gui.general.timeFormat
        switch (format) {
            case '24hours':
                return { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
            case '12hours':
                return { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' }
            default:
                return { timeStyle: 'short' }
        }
    })

    const formatTimeWithSecondsOptions = computed<DateTimeOptions>(() => {
        const format = store.state.gui.general.timeFormat
        switch (format) {
            case '24hours':
                return { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }
            case '12hours':
                return { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h12' }
            default:
                return { timeStyle: 'short' }
        }
    })

    const browserLocale = computed(() => navigator.language)

    const hours12Format = computed(() => store.getters['gui/getHours12Format'])

    function formatDate(value: number | Date, format: string | null = null): string {
        if (format === null) format = store.state.gui.general.dateFormat
        let tmp: Date | null = null
        try {
            tmp = value instanceof Date ? value : new Date(value)
        } catch {
            return 'UNKNOWN'
        }
        if (format === null) return tmp.toLocaleDateString(browserLocale.value, { dateStyle: 'medium' })
        if (format === 'iso') return tmp.toISOString().split('T')[0]
        if (format === 'short') return tmp.toLocaleDateString(browserLocale.value, { dateStyle: 'short' })

        let delimiter = '/'
        if (format.includes('-')) delimiter = '-'
        if (format.includes('.')) delimiter = '.'
        if (format.includes('. ')) delimiter = '. '

        const splits = format.split(delimiter)
        const output: string[] = []

        splits.forEach((part) => {
            part = part.trim().toLowerCase().replaceAll('.', '')
            switch (part) {
                case 'dd':
                    output.push(tmp?.getDate().toString().padStart(2, '0') ?? '00')
                    break
                case 'd':
                    output.push(`${tmp?.getDate()}`)
                    break
                case 'mm':
                    output.push(((tmp?.getMonth() ?? 0) + 1).toString().padStart(2, '0'))
                    break
                case 'm':
                    output.push(`${(tmp?.getMonth() ?? 0) + 1}`)
                    break
                case 'yyyy':
                    output.push(`${tmp?.getFullYear()}`)
                    break
                case 'yy':
                    output.push(`${tmp?.getFullYear().toString().slice(-2)}`)
                    break
                default:
                    output.push(part)
            }
        })

        if (format.endsWith('.')) return output.join(delimiter) + '.'

        return output.join(delimiter)
    }

    function formatTime(value: number | Date, boolSeconds = false): string {
        let tmp
        try {
            tmp = value instanceof Date ? value : new Date(value)
        } catch {
            return 'UNKNOWN'
        }
        if (boolSeconds)
            return tmp.toLocaleTimeString(browserLocale.value, formatTimeWithSecondsOptions.value)
        return tmp.toLocaleTimeString(browserLocale.value, formatTimeOptions.value)
    }

    function formatDateTime(value: number, boolSeconds = false): string {
        const date = formatDate(value)
        const time = formatTime(value, boolSeconds)
        return `${date} ${time}`
    }

    return {
        apiUrl,
        hostUrl,
        hostPort,
        instancesDB,
        socketIsConnected,
        guiIsReady,
        klippyIsConnected,
        klipperState,
        klipperReadyForGui,
        klipperAppName,
        printerIsPrinting,
        printerIsPrintingOnly,
        printerPowerDevice,
        isPrinterPowerOff,
        loadings,
        printer_state,
        isMobile,
        isTablet,
        isDesktop,
        isWidescreen,
        viewport,
        isTouchDevice,
        isIOS,
        moonrakerComponents,
        existGcodesRootDirectory,
        spoolManagerUrl,
        formatTimeOptions,
        formatTimeWithSecondsOptions,
        browserLocale,
        hours12Format,
        formatDate,
        formatTime,
        formatDateTime,
    }
}
