import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class ServiceMixins extends Vue {
    get hideOtherInstances() {
        return this.$store.state.gui.uiSettings.hideOtherInstances ?? false
    }

    get instance_ids() {
        return this.$store.state.server.system_info?.instance_ids ?? {}
    }

    get klipperInstance() {
        return this.instance_ids.klipper ?? ''
    }

    get moonrakerInstance() {
        return this.instance_ids.moonraker ?? ''
    }
}
