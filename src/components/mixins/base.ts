import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class BaseMixin extends Vue {

    get apiUrl(): boolean {
        return this.$store.getters['socket/getUrl']
    }

    get hostUrl(): boolean {
        return this.$store.getters['socket/getHostUrl']
    }

    get remoteMode() {
        return this.$store.state.socket.remoteMode
    }

    get socketIsConnected(): boolean {
        return this.$store.state.socket.isConnected ?? false
    }

    get klippyIsConnected(): boolean {
        return this.$store.state.server.klippy_connected ?? false
    }

    get klipperState(): string {
        return this.$store.state.server.klippy_state ?? ''
    }

    get klipperReadyForGui(): boolean {
        return (this.socketIsConnected && this.klipperState === 'ready')
    }

    get printerIsPrinting() {
        return (this.klipperReadyForGui && ['printing', 'paused'].includes(this.printer_state))
    }

    get loadings(): string[] {
        return this.$store.state.socket.loadings ?? []
    }

    get printer_state(): string {
        const printer_state = this.$store.state.printer.print_stats?.state ?? ''
        const timelapse_pause = this.$store.state.printer['gcode_macro TIMELAPSE_TAKE_FRAME']?.is_paused ?? false
        return (printer_state === 'paused' && timelapse_pause) ? 'printing' : printer_state
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

    get isTouchDevice() {
        // ignore if browser reports maxTouchPoints === 256, can happen on Windows 10
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints !== 256))
    }

    get moonrakerComponents() {
        return this.$store.state.server?.components ?? []
    }
}