<template>
    <tr>
        <td class="icon">
            <v-icon :color="iconColor" :class="iconClass" tabindex="-1">
                {{ icon }}
            </v-icon>
        </td>
        <td class="name">{{ formatName }}</td>
        <td v-if="!isResponsiveMobile" class="state">
            <v-tooltip v-if="state !== null" top>
                <template #activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">{{ state }}</div>
                </template>
                <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ avgState }} %</span>
            </v-tooltip>
        </td>
        <td class="current">
            <v-tooltip top :disabled="!(measured_min_temp !== null || measured_max_temp !== null)">
                <template #activator="{ on, attrs }">
                    <span style="cursor: default" v-bind="attrs" v-on="on">
                        {{ formatTemperature }}
                    </span>
                </template>
                <span>
                    {{ $t('Panels.TemperaturePanel.Max') }}: {{ measured_max_temp }}°C
                    <br />
                    {{ $t('Panels.TemperaturePanel.Min') }}: {{ measured_min_temp }}°C
                </span>
            </v-tooltip>
            <!--            <div v-for="(values, key) of object.additionalSensors" :key="key">
                                <span v-if="values.bool" class="d-block">
                                    <small>{{ values.value }} {{ values.unit }}</small>
                                </span>
            </div>-->
            <!--            <div v-if="object.rpm !== null">
                <small :class="object.rpmClass">{{ object.rpm }} RPM</small>
            </div>-->
        </td>
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
import { mdiThermometer } from '@mdi/js'
import { opacityHeaterActive, opacityHeaterInactive } from '@/store/variables'

@Component
export default class TemperaturePanelListItem extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: Boolean, required: true }) readonly isResponsiveMobile!: boolean

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

    get icon() {
        return mdiThermometer
    }

    get iconColor() {
        let color = this.$store.getters['printer/tempHistory/getDatasetColor'](this.name)
        if (this.target > 0) return `${color}${opacityHeaterActive}`

        return `${color}${opacityHeaterInactive}`
    }

    get iconClass() {
        const classes = ['_no-focus-style', 'cursor-pointer']

        return classes
    }

    get state() {
        window.console.log(this.objectName, this.printerObject)

        let state = this.printerObject.power ?? this.printerObject.speed ?? null
        if (state === null) return null
        if (state === 0) return 'off'

        return `${Math.round(state) * 100} %`
    }

    get avgPower() {
        return Math.round(this.$store.getters['printer/tempHistory/getAvgPower'](this.objectName) ?? 0)
    }

    get avgSpeed() {
        return Math.round(this.$store.getters['printer/tempHistory/getAvgSpeed'](this.objectName) ?? 0)
    }

    get avgState() {
        if ('power' in this.printerObject) return Math.round((this.avgPower ?? 0) * 100)
        if ('speed' in this.printerObject) return Math.round((this.avgSpeed ?? 0) * 100)

        return null
    }

    get temperature() {
        return this.printerObject?.temperature ?? null
    }

    get formatTemperature() {
        return `${this.temperature?.toFixed(1) ?? '--'}°C`
    }

    get measured_min_temp() {
        return this.printerObject?.measured_min_temp?.toFixed(1) ?? null
    }

    get measured_max_temp() {
        return this.printerObject?.measured_max_temp?.toFixed(1) ?? null
    }

    get target() {
        return this.printerObject?.target ?? null
    }
}
</script>

<style lang="scss" scoped>
::v-deep .v-icon._no-focus-style:focus::after {
    opacity: 0 !important;
}

::v-deep .cursor-pointer {
    cursor: pointer;
}
</style>
