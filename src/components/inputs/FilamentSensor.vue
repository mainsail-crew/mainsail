<style scoped>
    ._filamentRunout-subheader {
        height: auto;
    }
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_filamentRunout-subheader">
                    <v-icon small class="mr-2">mdi-printer-3d-nozzle-alert</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer></v-spacer>
                    <small :class="'mr-3 ' + statusColor+'--text'">{{ statusText }}</small>
                    <v-icon @click="changeSensor">{{ enabled ? "mdi-toggle-switch" : "mdi-toggle-switch-off-outline" }}</v-icon>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>


<script lang="ts">
import {convertName} from '@/plugins/helpers'
import {Component, Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class FilamentSensor extends Mixins(BaseMixin) {
    convertName = convertName

    @Prop({ type: String, required: true }) readonly name!: string
    @Prop({ type: Boolean, required: true }) readonly enabled!: boolean
    @Prop({ type: Boolean, required: true }) readonly filament_detected!: boolean

    get statusColor() {
        if (!this.enabled) return 'gray'
        else if (this.filament_detected) return 'success'
        else return 'danger'
    }

    get statusText() {
        if (!this.enabled) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Disabled')
        else if (this.filament_detected) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Detected')
        else return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Empty')
    }

    changeSensor() {
        const gcode = 'SET_FILAMENT_SENSOR SENSOR='+this.name+' ENABLE='+(this.enabled ? 0 : 1)
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
