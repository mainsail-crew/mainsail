import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class BaseMixin extends Vue {

    get apiUrl(): boolean {
        return this.$store.getters['socket/getUrl']
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
        return this.$store.state.server.klippy_state ?? ""
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
        return this.$store.state.printer.print_stats?.state ?? ""
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
}