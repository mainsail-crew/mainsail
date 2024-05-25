<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <div>{{ convertName(name) }}</div>    
                <v-subheader class="_moonraker-sensor-subheader">                                                                                
                    <table width="100%">
                            <tbody>
                                <moonraker-sensor-value
                                    v-for="(valueName, index) of valueNames"
                                    :key="'moonraker_sensor_value_' + index"
                                    :sensor="name"
                                    :value-name="valueName" />
                            </tbody>
                        </table>                    
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MoonrakerSensorValue from '@/components/panels/Miscellaneous/MoonrakerSensorValue.vue'
import {

} from '@mdi/js'

@Component({
    components: { MoonrakerSensorValue },
})
export default class MoonrakerSensor extends Mixins(BaseMixin) {
    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly name: string

    get valueNames() {
        const sensors = this.$store.state.server.sensor.sensors
        if (!(this.name in sensors)) return []

        return Object.keys(sensors[this.name].values)
    }
}
</script>

<style lang="scss">
._moonraker-sensor-subheader {
    height: auto;

.sensor-name {
    font-weight: bold;
    padding-left: 10px;
}
}
</style>
