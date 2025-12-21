<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="mb-1 d-block _moonraker-sensor-subheader">
                    {{ displayName }}
                </v-subheader>
                <v-subheader class="d-block _moonraker-sensor-subheader">
                    <moonraker-sensor-value
                        v-for="(valueName, index) of valueNames"
                        :key="'moonraker_sensor_value_' + index"
                        :sensor="name"
                        :value-name="valueName" />
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
import {} from '@mdi/js'

@Component({
    components: { MoonrakerSensorValue },
})
export default class MoonrakerSensor extends Mixins(BaseMixin) {
    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly name: string

    get sensor() {
        const sensors = this.$store.state.server.sensor.sensors
        if (!(this.name in sensors)) return undefined

        return sensors[this.name]
    }

    get displayName() {
        // If the friendly name is the same as the sensor name, then it hasn't been customized in the config
        // this is the fallback value in Moonraker, so we convert the sensor name to a more user-friendly format
        if (this.sensor?.friendly_name === this.name) {
            return this.convertName(this.name)
        }

        return this.sensor?.friendly_name
    }

    get valueNames() {
        return Object.keys(this.sensor?.values ?? {})
    }
}
</script>

<style scoped>
._moonraker-sensor-subheader {
    height: auto;
}
</style>
