import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class BaseMixin extends Vue {

    get apiUrl(): boolean {
        return this.$store.getters['socket/getUrl']
    }

    get socketIsConnected(): boolean {
        return this.$store.state.socket.isConnected ?? false
    }

    get klippyIsConnected(): boolean {
        return this.$store.state.server.klippy_connected ?? false
    }

    get isConnected(): boolean {
        return this.$store.state.socket.isConnected ?? false
    }

    get klipperState(): string {
        return this.$store.state.server.klippy_state ?? ""
    }

    get klipperReadyForGui(): boolean {
        return (this.isConnected && this.klipperState === 'ready')
    }

    get loadings(): string[] {
        return this.$store.state.socket.loadings ?? []
    }

    get printer_state(): string {
        return this.$store.state.printer.print_stats?.state ?? ""
    }
}