<style scoped lang="scss">
//._coord-input {
//    max-width: 110px !important;
//    text-align: right;
//}
</style>

<template>
    <v-container>
        <v-form @keyup.native.enter="sendCmd">
            <v-row dense>
                <v-col>
                    <move-to-input
                        v-model="input.x.pos"
                        :suffix="'X'"
                        :position-max="stepperXmax"
                        :position-min="stepperXmin"
                        :current-pos="positions.x"
                        :readonly="printerIsPrinting"
                        :disabled="!xAxisHomed"
                        @validate="validate"></move-to-input>
                </v-col>
                <v-col>
                    <move-to-input
                        v-model="input.y.pos"
                        :suffix="'Y'"
                        :position-max="stepperYmax"
                        :position-min="stepperYmin"
                        :current-pos="positions.y"
                        :readonly="printerIsPrinting"
                        :disabled="!yAxisHomed"
                        @validate="validate"></move-to-input>
                </v-col>
                <v-col>
                    <move-to-input
                        v-model="input.z.pos"
                        :label="displayGCodeZ ? `( ${positions.gcode_z} )` : ''"
                        :suffix="'Z'"
                        :position-max="stepperZmax"
                        :position-min="stepperZmin"
                        :current-pos="positions.z"
                        :readonly="printerIsPrinting"
                        :disabled="!zAxisHomed"
                        @validate="validate"></move-to-input>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import MoveToInput from '@/components/inputs/MoveToInput.vue'

@Component({
    components: { MoveToInput },
})
export default class MoveToControl extends Mixins(BaseMixin, ControlMixin) {
    @Prop({ type: Boolean, required: false, default: false })
    declare readonly displayGCodeZ: boolean

    input: { [index: string]: any } = {
        x: { pos: '', valid: true },
        y: { pos: '', valid: true },
        z: { pos: '', valid: true },
    }

    created(): void {
        // console.log(this.$store.state.printer.toolhead)
        this.input.x.pos = this.positions.x
        this.input.y.pos = this.positions.y
        this.input.z.pos = this.positions.z
    }

    validate(event: { axis: string; valid: boolean }): void {
        this.input[event.axis].valid = event.valid
    }

    @Watch('positions.x', { immediate: true })
    updatePositionX(newVal: string): void {
        this.input.x.pos = newVal
    }

    @Watch('positions.y', { immediate: true })
    updatePositionY(newVal: string): void {
        this.input.y.pos = newVal
    }

    @Watch('positions.z', { immediate: true })
    updatePositionZ(newVal: string): void {
        this.input.z.pos = newVal
    }

    @Watch('displayGCodeZ', { immediate: true })
    updatePositionGCodeZ(): void {
        console.log(this.displayGCodeZ)
    }

    /**
     * Axes home states
     */
    get xAxisHomed(): boolean {
        return this.$store.state.printer.toolhead?.homed_axes.includes('x') ?? false
    }

    get yAxisHomed(): boolean {
        return this.$store.state.printer.toolhead?.homed_axes.includes('y') ?? false
    }

    get zAxisHomed(): boolean {
        return this.$store.state.printer.toolhead?.homed_axes.includes('z') ?? false
    }

    /**
     * Axis limits
     */
    get stepperXmin(): number {
        return this.$store.state.printer.configfile?.settings?.stepper_x?.position_min ?? Number.NEGATIVE_INFINITY
    }

    get stepperXmax(): number {
        return this.$store.state.printer.configfile?.settings?.stepper_x?.position_max ?? Number.POSITIVE_INFINITY
    }

    get stepperYmin(): number {
        return this.$store.state.printer.configfile?.settings?.stepper_y?.position_min ?? Number.NEGATIVE_INFINITY
    }

    get stepperYmax(): number {
        return this.$store.state.printer.configfile?.settings?.stepper_y?.position_max ?? Number.POSITIVE_INFINITY
    }

    get stepperZmin(): number {
        return this.$store.state.printer.configfile?.settings?.stepper_z?.position_min ?? Number.NEGATIVE_INFINITY
    }

    get stepperZmax(): number {
        return this.$store.state.printer.configfile?.settings?.stepper_z?.position_max ?? Number.POSITIVE_INFINITY
    }

    /**
     * Axes positions and positioning mode (G90 / G91)
     */
    get positions() {
        return this.$store.getters['printer/getPositions']
    }

    get positionAbsolute(): boolean {
        return this.positions.absolute
    }

    // get coordinates() {
    //     return this.positions.coordinates
    //         ? this.$t('Panels.StatusPanel.Absolute')
    //         : this.$t('Panels.StatusPanel.Relative')
    // }

    sendCmd(): void {
        const xPos = this.input.x.pos !== this.positions.x ? ` X${this.input.x.pos}` : ''
        const yPos = this.input.y.pos !== this.positions.y ? ` Y${this.input.y.pos}` : ''
        const zPos = this.input.z.pos !== this.positions.z ? ` Z${this.input.z.pos}` : ''

        let gcode = ''
        if (!this.positionAbsolute) {
            gcode += 'G90\n'
        }
        if (zPos !== '') {
            gcode += `G1${zPos} F${this.feedrateZ * 60}\n`
        }
        if (xPos !== '' || yPos !== '') {
            gcode += `G1${xPos}${yPos} F${this.feedrateXY * 60}`
        }

        if (gcode !== '' && this.input.x.valid && this.input.y.valid && this.input.z.valid) {
            console.log(gcode)
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }

        return
    }
}
</script>
