import Vue from 'vue'
import Component from 'vue-class-component'
import { DateTimeFormatOptions } from 'vue-i18n'
import { ServerPowerStateDevice } from '@/store/server/power/types'

@Component
export default class BaseMixin extends Vue {
    get apiUrl(): boolean {
        return this.$store.getters['socket/getUrl']
    }

    get hostUrl(): boolean {
        return this.$store.getters['socket/getHostUrl']
    }

    get hostPort(): number {
        return parseInt(this.$store.state.socket.port ?? 80)
    }

    get instancesDB() {
        return this.$store.state.instancesDB ?? 'moonraker'
    }

    get socketIsConnected(): boolean {
        return this.$store.state.socket.isConnected ?? false
    }

    get guiIsReady() {
        return this.$store.state.socket.initializationList.length === 0
    }

    get klippyIsConnected(): boolean {
        return this.$store.state.server.klippy_connected ?? false
    }

    get klipperState(): string {
        if (!this.klippyIsConnected) return 'disconnected'

        return this.$store.state.server.klippy_state ?? ''
    }

    get klipperReadyForGui(): boolean {
        return this.socketIsConnected && this.klipperState === 'ready'
    }

    get klipperAppName() {
        return this.$store.state.printer.app_name ?? 'Klipper'
    }

    get printerIsPrinting() {
        return this.klipperReadyForGui && ['printing', 'paused'].includes(this.printer_state)
    }

    get printerIsPrintingOnly() {
        return this.klipperReadyForGui && this.printer_state === 'printing'
    }

    get printerPowerDevice(): string {
        const deviceName = this.$store.state.gui.uiSettings.powerDeviceName ?? null
        if (deviceName !== null) return deviceName

        const devices = this.$store.getters['server/power/getDevices'] ?? []
        return (
            devices.find((device: ServerPowerStateDevice) => device.device.toLowerCase() === 'printer')?.device ??
            'printer'
        )
    }

    get isPrinterPowerOff() {
        const devices = this.$store.getters['server/power/getDevices'] ?? []
        if (devices.length === 0) return false

        const deviceIndex = devices.findIndex(
            (device: ServerPowerStateDevice) => device.device === this.printerPowerDevice
        )
        // stop if device is not found
        if (deviceIndex === -1) return false

        const device = devices[deviceIndex]
        // Printer is on, if device status is "on" or "error"
        if (device.status !== 'off') return false

        // if klippy is not connected (service shutdown) and device.status === off
        return !this.klippyIsConnected
    }

    get loadings(): string[] {
        return this.$store.state.socket.loadings ?? []
    }

    get printer_state(): string {
        const printer_state =
            this.$store.state.printer.print_stats?.state ?? this.$store.state.printer.idle_timeout?.state ?? ''
        const timelapse_pause = this.$store.state.printer['gcode_macro TIMELAPSE_TAKE_FRAME']?.is_paused ?? false
        return printer_state === 'paused' && timelapse_pause ? 'printing' : printer_state
    }

    get isMobile() {
        return this.$vuetify.breakpoint.mobile
    }

    get isTablet() {
        return this.$vuetify.breakpoint.smAndUp && !this.isDesktop && !this.isWidescreen
    }

    get isDesktop() {
        return this.$vuetify.breakpoint.lgAndUp && !this.isWidescreen
    }

    get isWidescreen() {
        return this.$vuetify.breakpoint.xl
    }

    get viewport() {
        if (this.isMobile) return 'mobile'
        else if (this.isTablet) return 'tablet'
        else if (this.isDesktop) return 'desktop'
        else return 'widescreen'
    }

    get isTouchDevice() {
        // ignore if browser reports maxTouchPoints === 256, can happen on Windows 10
        return 'ontouchstart' in window || (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints !== 256)
    }

    get isIOS() {
        return !!(
            navigator.userAgent.match(/(iPad|iPhone|iPod)/) ||
            // @ts-ignore
            (navigator.platform === 'MacIntel' && typeof navigator.standalone !== 'undefined')
        )
    }

    get moonrakerComponents() {
        return this.$store.state.server?.components ?? []
    }

    get existGcodesRootDirectory() {
        const roots = this.$store.state.server.registered_directories

        return roots.findIndex((root: string) => root === 'gcodes') >= 0
    }

    get formatTimeOptions(): DateTimeFormatOptions {
        const format = this.$store.state.gui.general.timeFormat

        switch (format) {
            case '24hours':
                return { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }

            case '12hours':
                return { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' }

            default:
                return { timeStyle: 'short' }
        }
    }

    get formatTimeWithSecondsOptions(): DateTimeFormatOptions {
        const format = this.$store.state.gui.general.timeFormat

        switch (format) {
            case '24hours':
                return { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }

            case '12hours':
                return { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h12' }

            default:
                return { timeStyle: 'short' }
        }
    }

    get browserLocale() {
        return navigator.language
    }

    get hours12Format() {
        return this.$store.getters['gui/getHours12Format']
    }

    formatDate(value: number | Date, format: string | null = null): string {
        if (format === null) format = this.$store.state.gui.general.dateFormat
        let tmp: Date | null = null

        try {
            // @ts-ignore
            tmp = (typeof value.getMonth === 'function' ? value : new Date(value)) as Date
        } catch (_) {
            return 'UNKNOWN'
        }

        if (format === null) return tmp.toLocaleDateString(this.browserLocale, { dateStyle: 'medium' })
        if (format === 'iso') return tmp.toISOString().split('T')[0]
        if (format === 'short') return tmp.toLocaleDateString(this.browserLocale, { dateStyle: 'short' })

        let delimiter = '/'
        if (format.includes('-')) delimiter = '-'
        if (format.includes('.')) delimiter = '.'
        if (format.includes('. ')) delimiter = '. '

        const splits = format.split(delimiter)
        const output: string[] = []

        splits.forEach((part) => {
            // replace all dots is needed for kr-KO, because it ends only with a dot and not with '. '
            part = part.trim().toLowerCase().replaceAll('.', '')

            switch (part) {
                case 'dd':
                    output.push(tmp?.getDate().toString().padStart(2, '0') ?? '00')
                    break
                case 'd':
                    output.push(`${tmp?.getDate()}`)
                    break
                case 'mm':
                    output.push((tmp?.getMonth() ?? 0).toString().padStart(2, '0'))
                    break
                case 'm':
                    output.push(`${tmp?.getMonth() ?? 0}`)
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

    formatTime(value: number | Date, boolSeconds = false): string {
        let tmp = null

        try {
            // @ts-ignore
            tmp = (typeof value.getMonth === 'function' ? value : new Date(value)) as Date
        } catch (_) {
            return 'UNKNOWN'
        }

        if (boolSeconds) return tmp.toLocaleTimeString(this.browserLocale, this.formatTimeWithSecondsOptions)

        return tmp.toLocaleTimeString(this.browserLocale, this.formatTimeOptions)
    }

    formatDateTime(value: number, boolSeconds = false): string {
        const date = this.formatDate(value)
        const time = this.formatTime(value, boolSeconds)

        return `${date} ${time}`
    }
}
