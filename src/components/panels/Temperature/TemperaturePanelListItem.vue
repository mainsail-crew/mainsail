<template>
    <tr>
        <td class="icon">
            <v-icon :color="iconColor" :class="iconClass" tabindex="-1" @click="showEditDialog = true">
                {{ icon }}
            </v-icon>
        </td>
        <td class="name">
            <span class="cursor-pointer" @click="showEditDialog = true">{{ formatName }}</span>
        </td>
        <td v-if="!isResponsiveMobile" class="state">
            <v-tooltip v-if="state !== null" top>
                <template #activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">{{ formatState }}</div>
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
            <div v-if="rpm !== null">
                <small :class="rpmClass">{{ rpm }} RPM</small>
            </div>
            <temperature-panel-list-item-additional-sensor
                v-if="additionalSensorName"
                :object-name="objectName"
                :additional-object-name="additionalSensorName" />
        </td>
        <td class="target">
            <temperature-input
                v-if="command !== null"
                :name="name"
                :target="target"
                :presets="presets"
                :min_temp="min_temp"
                :max_temp="max_temp"
                :command="command"
                :attribute-name="commandAttributeName" />
        </td>
        <temperature-panel-list-item-edit
            :bool-show="showEditDialog"
            :object-name="objectName"
            :name="name"
            :format-name="formatName"
            :additional-sensor-name="additionalSensorName"
            :icon="icon"
            :color="color"
            @close-dialog="showEditDialog = false" />
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'
import {
    mdiFan,
    mdiFire,
    mdiPrinter3dNozzle,
    mdiPrinter3dNozzleAlert,
    mdiRadiator,
    mdiRadiatorDisabled,
    mdiThermometer,
} from '@mdi/js'
import { additionalSensors, opacityHeaterActive, opacityHeaterInactive } from '@/store/variables'

@Component
export default class TemperaturePanelListItem extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: Boolean, required: true }) readonly isResponsiveMobile!: boolean

    showEditDialog = false

    get printerObject() {
        if (!(this.objectName in this.$store.state.printer)) return {}

        return this.$store.state.printer[this.objectName]
    }

    get printerObjectSettings() {
        // convert objectName to lowercase, because klipper only user lowercase in configfile.settings
        const lowerCaseObjectName = this.objectName.toLowerCase()

        if (!(lowerCaseObjectName in (this.$store.state.printer?.configfile?.settings ?? {}))) return {}

        return this.$store.state.printer?.configfile?.settings[lowerCaseObjectName]
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
        // handle extruder icons
        if (this.objectName.startsWith('extruder')) {
            if (this.printerObject.can_extrude ?? false) return mdiPrinter3dNozzle

            return mdiPrinter3dNozzleAlert
        }

        // show heater_bed icon
        if (this.objectName === 'heater_bed') {
            if (
                (this.temperature !== null && this.temperature > 50) ||
                (this.target && this.temperature && this.temperature > this.target - 5)
            )
                return mdiRadiator

            return mdiRadiatorDisabled
        }

        // show heater_generic icon
        if (this.objectName.startsWith('heater_generic')) return mdiFire

        // show fan icon, if it is a fan
        if (this.isFan) return mdiFan

        return mdiThermometer
    }

    get color() {
        return this.$store.getters['printer/tempHistory/getDatasetColor'](this.objectName)
    }

    get iconColor() {
        // set icon color to active, if no target exists (temperature_sensors) or a heater is active
        if (this.target === null || this.target > 0) return `${this.color}${opacityHeaterActive}`

        return `${this.color}${opacityHeaterInactive}`
    }

    get iconClass() {
        const classes = ['_no-focus-style', 'cursor-pointer']

        // add icon animation, when it is a fan and state > 0
        if (this.isFan) {
            const disableFanAnimation = this.$store.state.gui?.uiSettings.disableFanAnimation ?? false

            if (!disableFanAnimation && (this.state ?? 0) > 0) classes.push('icon-rotate')
        }

        return classes
    }

    get isFan() {
        return this.objectName.startsWith('temperature_fan')
    }

    get state(): number | null {
        return this.printerObject.power ?? this.printerObject.speed ?? null
    }

    get formatState() {
        if (this.state === null) return null
        if (this.target === 0 && this.state === 0) return 'off'

        return `${Math.round(this.state * 100)} %`
    }

    get avgPower() {
        return this.$store.getters['printer/tempHistory/getAvgPower'](this.name) ?? 0
    }

    get avgSpeed() {
        return this.$store.getters['printer/tempHistory/getAvgSpeed'](this.name) ?? 0
    }

    get avgState() {
        if ('power' in this.printerObject) return Math.round(this.avgPower)
        if ('speed' in this.printerObject) return Math.round(this.avgSpeed)

        return null
    }

    get temperature(): number | null {
        return this.printerObject?.temperature ?? null
    }

    get formatTemperature() {
        return `${this.temperature?.toFixed(1) ?? '--'}°C`
    }

    get min_temp() {
        return parseInt(this.printerObjectSettings.min_temp ?? 0)
    }

    get max_temp() {
        return parseInt(this.printerObjectSettings.max_temp ?? 0)
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

    get additionalSensorName() {
        if (this.objectName === 'z_thermal_adjust') return 'z_thermal_adjust'

        const additionalSensorName = additionalSensors.find((sensorName) => {
            const objectName = `${sensorName} ${this.name}`

            if (objectName in this.$store.state.printer) return true
        })

        if (!additionalSensorName) return null

        return `${additionalSensorName} ${this.name}`
    }

    get rpm() {
        const rpm = this.printerObject.rpm ?? null

        // return null when rpm doesn't exist
        if (rpm === null) return null

        return parseInt(this.printerObject.rpm)
    }

    get rpmClass() {
        if (this.rpm === 0 && (this.printerObject.speed ?? 0) > 0) return 'red--text'

        return ''
    }

    get presets() {
        return this.$store.getters['gui/presets/getPresetsFromHeater']({ name: this.objectName }) ?? []
    }

    get command() {
        if (this.objectName.startsWith('temperature_fan')) return 'SET_TEMPERATURE_FAN_TARGET'
        if (this.objectName.startsWith('extruder') || this.objectName.startsWith('heater_'))
            return 'SET_HEATER_TEMPERATURE'

        return null
    }

    get commandAttributeName() {
        if (this.command === 'SET_HEATER_TEMPERATURE') return 'HEATER'
        if (this.command === 'SET_TEMPERATURE_FAN_TARGET') return 'TEMPERATURE_FAN'

        return ''
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
