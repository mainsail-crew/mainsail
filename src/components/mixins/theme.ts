import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class ThemeMixin extends Vue {
    protected fgColor(alpha: number = 1, dark: boolean = this.$vuetify.theme.dark): string {
        const base = dark ? 255 : 0
        return `rgba(${base}, ${base}, ${base}, ${alpha})`
    }

    protected bgColor(alpha: number = 1) {
        return this.fgColor(alpha, !this.$vuetify.theme.dark)
    }

    get fgColorHi() {
        return this.fgColor(0.8)
    }

    get fgColorMid() {
        return this.fgColor(0.5)
    }

    get fgColorLow() {
        return this.fgColor(0.2)
    }

    get fgColorFaint() {
        return this.fgColor(0.1)
    }

    get machineButtonCol() {
        return this.$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-1'
    }
}
