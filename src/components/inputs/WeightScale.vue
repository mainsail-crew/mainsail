<style scoped>
._weightScale-subheader {
    height: auto;
}
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_weightScale-subheader">
                    <v-icon small class="mr-2">{{ mdiScale }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer></v-spacer>
                    <small>{{ weightText }}</small>
                    <v-icon @click="setTareZero">
                        {{ mdiNumeric0Box }}
                    </v-icon>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiScale, mdiNumeric0Box } from '@mdi/js'

@Component
export default class WeightScale extends Mixins(BaseMixin) {
    /**
     * Icons
     */

    mdiScale = mdiScale
    mdiNumeric0Box = mdiNumeric0Box

    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Boolean, required: true }) declare readonly calibrated: boolean
    @Prop({ type: Number, required: true }) declare readonly weight: number

    get weightText() {
        if (!this.calibrated) return 'Uncalibrated'
        // round so we don't have -0.0 values.
        return Math.round(this.weight * 10) / 10
    }

    setTareZero() {
        const gcode = 'TARE_SCALE SCALE=' + this.name
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
