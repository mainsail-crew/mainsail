import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class AfcMixin extends Vue {
    get afc() {
        return this.$store.state.printer.AFC ?? {}
    }

    get afcErrorState() {
        return this.afc.error_state ?? false
    }

    get afcCurrentLane() {
        const current = this.afc.current_load ?? this.afc.current_lane ?? null
        if (current === null) return null

        const key = `AFC_stepper ${current}`
        const printer = this.$store.state.printer ?? {}

        return printer[key] ?? null
    }

    get afcCurrentBuffer() {
        const name = this.afcCurrentLane?.buffer ?? null
        if (name === null) return null

        const key = `AFC_buffer ${name}`
        const printer = this.$store.state.printer ?? {}

        return printer[key] ?? null
    }

    get afcCurrentState() {
        return this.afc.current_state ?? ''
    }
}
