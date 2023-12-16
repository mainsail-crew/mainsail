<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_filamentRunout-subheader">
                    <v-icon small class="mr-2">{{ mdiPrinter3dNozzleAlert }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <small :class="'mr-3 ' + statusColor + '--text'">{{ statusText }}</small>
                    <v-icon @click="changeSensor">
                        {{ enabled ? mdiToggleSwitch : mdiToggleSwitchOffOutline }}
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
import { mdiPrinter3dNozzleAlert, mdiToggleSwitch, mdiToggleSwitchOffOutline } from '@mdi/js'

@Component
export default class FilamentSensor extends Mixins(BaseMixin) {
    /**
     * Icons
     */

    mdiToggleSwitch = mdiToggleSwitch
    mdiToggleSwitchOffOutline = mdiToggleSwitchOffOutline
    mdiPrinter3dNozzleAlert = mdiPrinter3dNozzleAlert

    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Boolean, required: true }) declare readonly enabled: boolean
    @Prop({ type: Boolean, required: true }) declare readonly filament_detected: boolean

    get statusColor() {
        if (!this.enabled) return 'gray'
        else if (this.filament_detected) return 'success'

        return 'warning'
    }

    get statusText() {
        if (this.filament_detected) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Detected')

        return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Empty')
    }

    changeSensor() {
        const gcode = 'SET_FILAMENT_SENSOR SENSOR=' + this.name + ' ENABLE=' + (this.enabled ? 0 : 1)
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>

<style scoped>
._filamentRunout-subheader {
    height: auto;
}
</style>
