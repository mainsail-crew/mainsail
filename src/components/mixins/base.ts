import Vue from 'vue'
import Component from 'vue-class-component'
import { DateTimeFormatOptions } from 'vue-i18n'

@Component
export default class BaseMixin extends Vue {
    get apiUrl(): boolean {
        return this.$store.getters['socket/getUrl']
    }

    get hostUrl(): boolean {
        return this.$store.getters['socket/getHostUrl']
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
        return this.$store.state.server.klippy_state ?? ''
    }

    get klipperReadyForGui(): boolean {
        return this.socketIsConnected && this.klipperState === 'ready'
    }

    get printerIsPrinting() {
        return this.klipperReadyForGui && ['printing', 'paused'].includes(this.printer_state)
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
        return /iPad|iPhone|iPod/.test(navigator.userAgent)
    }

    get moonrakerComponents() {
        return this.$store.state.server?.components ?? []
    }

    get existGcodesRootDirectory() {
        const roots = this.$store.state.server.registered_directories

        return roots.findIndex((root: string) => root === 'gcodes') >= 0
    }

    get formatDateOptions(): DateTimeFormatOptions {
        const format = this.$store.state.gui.general.dateFormat

        switch (format) {
            case '2-digits':
                return { day: '2-digit', month: '2-digit', year: 'numeric' }

            case 'short':
                return { day: '2-digit', month: 'short', year: 'numeric' }

            default:
                return { dateStyle: 'medium' }
        }
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
        return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language
    }

    get hours12Format() {
        const setting = this.$store.state.gui.general.timeFormat
        if (setting === '12hours') return true
        if (setting === null && this.browserLocale === 'en_us') return true

        return false
    }

    formatDate(value: number | Date): string {
        let tmp = null

        try {
            // @ts-ignore
            tmp = (typeof value.getMonth === 'function' ? value : new Date(value)) as Date
        } catch (_) {
            return 'UNKNOWN'
        }

        return tmp.toLocaleDateString(this.browserLocale, this.formatDateOptions)
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
