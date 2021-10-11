<style lang="scss" scoped>
.axis-input-group {
    gap: 10px;
    display: inline-flex;
    align-items: center;
}
.goto-group {
    display: inline-flex;
    align-items: center;
    padding-top: 5px;
}
</style>

<template>
    <div class="mt-3">
        <v-form
            v-model="valid"
            lazy-validation
            @submit.prevent="sendCmd"
        >
            <div class="goto-group">
                <div background-color="blue" dark class="axis-input-group">
                    <coordinate-number-input
                        label="X"
                        v-model="coordinate.x"
                        :min-value="stepperXmin"
                        :max-value="stepperXmax"></coordinate-number-input>
                    <coordinate-number-input
                        label="Y"
                        v-model="coordinate.y"
                        :min-value="stepperYmin"
                        :max-value="stepperYmax"></coordinate-number-input>
                    <coordinate-number-input
                        label="Z"
                        v-model="coordinate.z"
                        :min-value="stepperZmin"
                        :max-value="stepperZmax"></coordinate-number-input>
                    <v-btn color="primary" type="submit" :disabled="!valid || !hasValues">
                        <v-icon small class="mr-1">mdi-cursor-move</v-icon>
                        {{ $t('Panels.ControlPanel.Goto') }}
                    </v-btn>
                </div>
            </div>
        </v-form>
    </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import ControlMixin from '@/components/mixins/control'
import CoordinateNumberInput from '@/components/inputs/CoordinateNumberInput.vue'

@Component({
    components: {CoordinateNumberInput}
})
export default class ControlPanelGotoControl extends Mixins(BaseMixin, ControlMixin) {
    valid = true

    coordinate = {
        x: '',
        y: '',
        z: ''
    }

    get hasValues() {
        return Object.values(this.coordinate).some(value => value !== '')
    }

    get absolute_coordinates() {
        return this.$store.state.printer?.gcode_move?.absolute_coordinates ?? true
    }

    get stepperXmin() {
        return this.$store.state.printer.configfile?.settings?.stepper_x?.position_min ?? Number.NEGATIVE_INFINITY
    }

    get stepperXmax() {
        return this.$store.state.printer.configfile?.settings?.stepper_x?.position_max ?? Number.POSITIVE_INFINITY
    }

    get stepperYmin() {
        return this.$store.state.printer.configfile?.settings?.stepper_y?.position_min ?? Number.NEGATIVE_INFINITY
    }

    get stepperYmax() {
        return this.$store.state.printer.configfile?.settings?.stepper_y?.position_max ?? Number.POSITIVE_INFINITY
    }

    get stepperZmax() {
        return this.$store.state.printer.configfile?.settings?.stepper_z?.position_max ?? Number.POSITIVE_INFINITY
    }

    get stepperZmin() {
        return this.$store.state.printer.configfile?.settings?.stepper_z?.position_min ?? Number.NEGATIVE_INFINITY
    }

    get feedrateXY() {
        return this.$store.state.gui.dashboard?.control?.feedrateXY ?? 100
    }

    get feedrateZ() {
        return this.$store.state.gui.dashboard?.control?.feedrateZ ?? 10
    }

    private getZGcode() {
        const parsedZ = parseFloat(this.coordinate.z)

        if (!isNaN(parsedZ)) {
            return [`G1 Z${parsedZ} F${this.feedrateZ*60}`]
        }

        return []
    }

    private getXYGcode() {
        const parsedX = parseFloat(this.coordinate.x)
        const parsedY = parseFloat(this.coordinate.y)

        if (isNaN(parsedX) && isNaN(parsedY)) {
            return []
        }

        const xCode = isNaN(parsedX) ? '' : `X${parsedX} `
        const yCode = isNaN(parsedY) ? '' : `Y${parsedY} `

        return [`G1 ${xCode}${yCode}F${this.feedrateXY*60}`]
    }

    private getGcode() {
        if (this.absolute_coordinates) {
            [
                ...this.getZGcode(),
                ...this.getXYGcode(),
            ].join('\n').trim()
        }

        return [
            'G90',
            ...this.getZGcode(),
            ...this.getXYGcode(),
            'G91'
        ].join('\n').trim()
    }

    sendCmd() {
        const gcode = this.getGcode()
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
        this.reset()
    }

    reset() {
        this.coordinate = {
            x: '',
            y: '',
            z: ''
        }
    }

}
</script>
