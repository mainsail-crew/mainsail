<template>
    <responsive
        :breakpoints="{
            xsmall: (el) => el.width <= 320,
            small: (el) => el.width > 320 && el.width <= 460,
            medium: (el) => el.width > 460 && el.width <= 560,
            large: (el) => el.width > 560,
        }">
        <template #default="{ el }">
            <v-container class="py-0">
                <v-row class="flex-nowrap pb-1">
                    <v-col
                        :class="{
                            'col-5': el.is.small,
                            'col-4': el.is.xsmall || el.is.medium,
                            'col-3': el.is.large,
                        }"
                        class="v-subheader text--secondary mr-2">
                        <v-icon small class="mr-1">
                            {{ mdiCrosshairsGps }}
                        </v-icon>
                        <span v-if="!el.is.xsmall" class="text-no-wrap">
                            {{ $t('Panels.ToolheadControlPanel.Position') }}:&nbsp;
                        </span>
                        <span class="text-no-wrap">{{ displayPositionAbsolute }}</span>
                    </v-col>
                    <v-col
                        v-if="currentProfileName"
                        class="v-subheader text--secondary pl-2 justify-end text-no-wrap text-truncate">
                        <v-icon small class="mr-1">
                            {{ mdiGrid }}
                        </v-icon>
                        <span class="text-no-wrap text-truncate">
                            {{ currentProfileName }}
                        </span>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col :class="el.is.xsmall ? 'col-12' : 'col-4'">
                        <move-to-input
                            v-model="input.x.pos"
                            :label="livePositions.x"
                            :suffix="'X'"
                            :position-max="stepperXmax"
                            :position-min="stepperXmin"
                            :step="0.01"
                            :current-pos="gcodePositions.x"
                            :readonly="['printing'].includes(printer_state)"
                            :disabled="!xAxisHomed"
                            @validate="validate"
                            @submit="sendCmd"></move-to-input>
                    </v-col>
                    <v-col :class="el.is.xsmall ? 'col-12' : 'col-4'">
                        <move-to-input
                            v-model="input.y.pos"
                            :label="livePositions.y"
                            :suffix="'Y'"
                            :position-max="stepperYmax"
                            :position-min="stepperYmin"
                            :step="0.01"
                            :current-pos="gcodePositions.y"
                            :readonly="['printing'].includes(printer_state)"
                            :disabled="!yAxisHomed"
                            @validate="validate"
                            @submit="sendCmd"></move-to-input>
                    </v-col>
                    <v-col :class="el.is.xsmall ? 'col-12' : 'col-4'">
                        <move-to-input
                            v-model="input.z.pos"
                            :label="livePositions.z"
                            :suffix="'Z'"
                            :position-max="stepperZmax"
                            :position-min="stepperZmin"
                            :step="0.001"
                            :current-pos="gcodePositions.z"
                            :readonly="['printing'].includes(printer_state)"
                            :disabled="!zAxisHomed"
                            @validate="validate"
                            @submit="sendCmd"></move-to-input>
                    </v-col>
                </v-row>
            </v-container>
        </template>
    </responsive>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import MoveToInput from '@/components/inputs/MoveToInput.vue'
import Responsive from '@/components/ui/Responsive.vue'
import { mdiCrosshairsGps, mdiGrid } from '@mdi/js'

@Component({
    components: { MoveToInput, Responsive },
})
export default class MoveToControl extends Mixins(BaseMixin, ControlMixin) {
    mdiCrosshairsGps = mdiCrosshairsGps
    mdiGrid = mdiGrid

    input: { [index: string]: any } = {
        x: { pos: '', valid: true },
        y: { pos: '', valid: true },
        z: { pos: '', valid: true },
    }

    validate(event: { axis: string; valid: boolean }): void {
        this.input[event.axis].valid = event.valid
    }

    @Watch('gcodePositions.x', { immediate: true })
    updatePositionX(newVal: string): void {
        this.input.x.pos = newVal
    }

    @Watch('gcodePositions.y', { immediate: true })
    updatePositionY(newVal: string): void {
        this.input.y.pos = newVal
    }

    @Watch('gcodePositions.z', { immediate: true })
    updatePositionZ(newVal: string): void {
        this.input.z.pos = newVal
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
    get displayPositionAbsolute() {
        return this.positionAbsolute
            ? this.$t('Panels.ToolheadControlPanel.Absolute')
            : this.$t('Panels.ToolheadControlPanel.Relative')
    }

    get positionAbsolute() {
        return this.$store.state.printer.gcode_move?.absolute_coordinates ?? true
    }

    get livePositions() {
        const pos = this.$store.state.printer.motion_report?.live_position ?? [0, 0, 0]
        return {
            x: pos[0]?.toFixed(2) ?? '--',
            y: pos[1]?.toFixed(2) ?? '--',
            z: pos[2]?.toFixed(3) ?? '--',
        }
    }

    get gcodePositions() {
        const pos = this.$store.state.printer.gcode_move?.gcode_position ?? [0, 0, 0]
        return {
            x: pos[0]?.toFixed(2) ?? '--',
            y: pos[1]?.toFixed(2) ?? '--',
            z: pos[2]?.toFixed(3) ?? '--',
        }
    }

    /**
     * Get currently loaded bed mesh profile name
     */
    get bed_mesh() {
        return this.$store.state.printer.bed_mesh ?? null
    }

    get currentProfileName() {
        return this.bed_mesh?.profile_name ?? ''
    }

    sendCmd(): void {
        const xPos = this.input.x.pos !== this.gcodePositions.x ? ` X${this.input.x.pos}` : ''
        const yPos = this.input.y.pos !== this.gcodePositions.y ? ` Y${this.input.y.pos}` : ''
        const zPos = this.input.z.pos !== this.gcodePositions.z ? ` Z${this.input.z.pos}` : ''

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
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }

        return
    }
}
</script>
