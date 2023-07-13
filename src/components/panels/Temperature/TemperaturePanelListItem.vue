<template>
    <tr>
        <td class="icon">bla</td>
        <td class="name">{{ formatName }}</td>
    </tr>

    <!--                    <tr v-for="(object, index) in temperatureObjects" :key="index">
                        <td class="icon">
                            <v-icon
                                :color="object.iconColor"
                                :class="`_no-focus-style ${object.iconClass}`"
                                style="cursor: pointer"
                                tabindex="-1"
                                @click="openHeater(object)">
                                {{ object.icon }}
                            </v-icon>
                        </td>
                        <td class="name">
                            <span style="cursor: pointer" @click="openHeater(object)">
                                {{ convertName(object.name) }}
                            </span>
                        </td>
                        <td v-if="!el.is.mobile" class="state">
                            <v-tooltip v-if="object.state !== null" top>
                                <template #activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on">
                                        {{ object.state }}
                                    </div>
                                </template>
                                <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ object.avgState }}</span>
                            </v-tooltip>
                        </td>
                        <td class="current">
                            <v-tooltip
                                top
                                :disabled="!(object.measured_min_temp !== null || object.measured_max_temp !== null)">
                                <template #activator="{ on, attrs }">
                                    <span style="cursor: default" v-bind="attrs" v-on="on">
                                        {{ object.temperature.toFixed(1) }}°C
                                    </span>
                                </template>
                                <span>
                                    {{ $t('Panels.TemperaturePanel.Max') }}: {{ object.measured_max_temp }}°C
                                    <br />
                                    {{ $t('Panels.TemperaturePanel.Min') }}: {{ object.measured_min_temp }}°C
                                </span>
                            </v-tooltip>
                            <div v-for="(values, key) of object.additionalSensors" :key="key">
                                <span v-if="values.bool" class="d-block">
                                    <small>{{ values.value }} {{ values.unit }}</small>
                                </span>
                            </div>
                            <div v-if="object.rpm !== null">
                                <small :class="object.rpmClass">{{ object.rpm }} RPM</small>
                            </div>
                        </td>
                        <td class="target">
                            <temperature-input
                                v-if="object.command !== null"
                                :name="object.name"
                                :target="object.target"
                                :presets="object.presets"
                                :min_temp="object.min_temp"
                                :max_temp="object.max_temp"
                                :command="object.command"
                                :attribute-name="object.commandAttributeName" />
                        </td>
                    </tr>-->
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'

@Component
export default class TemperaturePanelListItem extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string

    get printerObject() {
        if (!(this.objectName in this.$store.state.printer)) return {}

        return this.$store.state.printer[this.objectName]
    }

    get name() {
        const splits = this.objectName.split(' ')
        if (splits.length === 1) return this.objectName

        return splits[1]
    }

    get formatName() {
        return convertName(this.name)
    }
}
</script>

<style lang="scss" scoped></style>
