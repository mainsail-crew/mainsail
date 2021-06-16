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
                    <span>{{ name }}</span>
                    <v-spacer></v-spacer>
                    <small :class="'mr-3 ' + (filament_detected ? 'success--text' : 'danger--text')">{{ (filament_detected ? $t('Panels.MiscellaneousPanel.RunoutSensor.Detected') : $t('Panels.MiscellaneousPanel.RunoutSensor.Empty')) }}</small>
                    <v-icon @click="changeSensor">{{ enabled ? "mdi-toggle-switch" : "mdi-toggle-switch-off-outline" }}</v-icon>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>


<script lang="ts">
import {convertName} from "@/plugins/helpers";
import {Component, Mixins, Prop} from "vue-property-decorator";
import BaseMixin from "@/components/mixins/base";

@Component
export default class FilamentSensor extends Mixins(BaseMixin) {
    convertName = convertName

    @Prop({ type: String, required: true }) readonly name!: string
    @Prop({ type: Boolean, required: true }) readonly enabled!: boolean
    @Prop({ type: Boolean, required: true }) readonly filament_detected!: boolean

    changeSensor() {
        const gcode = 'SET_FILAMENT_SENSOR SENSOR='+this.name+' ENABLE='+(this.enabled ? 0 : 1)
        this.$store.commit('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
