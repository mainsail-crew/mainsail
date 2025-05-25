import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class AfcMixin extends Vue {
    get afc() {
        return this.$store.state.printer.AFC ?? {}
    }

    get afcCurrentLoad(): string {
        const currentLane = this.afc.current_load ?? ''
        const key = `AFC_stepper ${currentLane}`
        const printer = this.$store.state.printer ?? {}

        return printer[key] ?? null
    }
}
