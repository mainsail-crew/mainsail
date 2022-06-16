<template>
    <div>
        <panel
            v-if="klipperReadyForGui"
            :icon="mdiThermometerLines"
            :title="$t('Panels.TemperaturePanel.Headline').toString()"
            :collapsible="true"
            card-class="temperature-panel">
            <!-- PRESET MENU -->
            <template #buttons>
                <v-menu v-if="presets.length" :offset-y="true" left title="Preheat">
                    <template #activator="{ on, attrs }">
                        <v-btn
                            text
                            tile
                            color="primary"
                            v-bind="attrs"
                            :disabled="['printing', 'paused'].includes(printer_state)"
                            class="pa-1"
                            v-on="on">
                            <span class="d-none ml-1 d-md-block">{{ $t('Panels.TemperaturePanel.Presets') }}</span>
                            <v-icon class="d-md-none">{{ mdiFire }}</v-icon>
                            <v-icon>{{ mdiMenuDown }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense class="py-0">
                        <v-list-item v-for="preset of presets" :key="preset.index" link @click="preheat(preset)">
                            <div class="d-flex align-center _preset-title">
                                <v-icon small class="mr-1">{{ mdiFire }}</v-icon>
                                <span style="padding-top: 2px">{{ preset.name }}</span>
                            </div>
                        </v-list-item>
                    </v-list>
                    <v-divider></v-divider>
                    <v-list dense class="py-0">
                        <v-list-item link @click="cooldown()">
                            <div class="d-flex align-center _preset-title">
                                <v-icon small color="primary" class="mr-1">{{ mdiSnowflake }}</v-icon>
                                <span class="primary--text">{{ $t('Panels.TemperaturePanel.Cooldown') }}</span>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn
                    v-if="presets.length === 0"
                    :icon="$vuetify.breakpoint.smAndDown"
                    :text="$vuetify.breakpoint.mdAndUp"
                    tile
                    color="primary"
                    @click="cooldown()">
                    <v-icon small>{{ mdiSnowflake }}</v-icon>
                    <span class="d-none ml-1 d-md-inline">{{ $t('Panels.TemperaturePanel.Cooldown') }}</span>
                </v-btn>
                <v-menu
                    :offset-y="true"
                    :close-on-content-click="false"
                    :title="$t('Panels.TemperaturePanel.SetupTemperatures')">
                    <template #activator="{ on, attrs }">
                        <v-btn icon tile v-bind="attrs" v-on="on">
                            <v-icon small>{{ mdiCog }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item class="minHeight36">
                            <v-checkbox
                                v-model="boolTempchart"
                                class="mt-0"
                                hide-details
                                :label="$t('Panels.TemperaturePanel.ShowChart')"></v-checkbox>
                        </v-list-item>
                        <v-list-item class="minHeight36">
                            <v-checkbox
                                v-model="autoscaleTempchart"
                                class="mt-0"
                                hide-details
                                :label="$t('Panels.TemperaturePanel.AutoscaleChart')"></v-checkbox>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <v-card-text class="pa-0">
                <responsive
                    :breakpoints="{
                        mobile: (el) => el.width <= 390,
                    }">
                    <template #default="{ el }">
                        <v-simple-table class="temperature-panel-table">
                            <thead>
                                <tr>
                                    <th class="icon">&nbsp;</th>
                                    <th class="name">{{ $t('Panels.TemperaturePanel.Name') }}</th>
                                    <th v-if="!el.is.mobile" class="state">
                                        {{ $t('Panels.TemperaturePanel.State') }}
                                    </th>
                                    <th class="current">
                                        {{ $t('Panels.TemperaturePanel.Current') }}
                                    </th>
                                    <th class="target">
                                        {{ $t('Panels.TemperaturePanel.Target') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(object, index) in temperatureObjects" :key="index">
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
                                                <small v-bind="attrs" v-on="on">
                                                    {{ object.state }}
                                                </small>
                                            </template>
                                            <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ object.avgState }}</span>
                                        </v-tooltip>
                                    </td>
                                    <td class="current">
                                        <v-tooltip
                                            top
                                            :disabled="
                                                !(
                                                    object.measured_min_temp !== null ||
                                                    object.measured_max_temp !== null
                                                )
                                            ">
                                            <template #activator="{ on, attrs }">
                                                <span style="cursor: default" v-bind="attrs" v-on="on">
                                                    {{ object.temperature.toFixed(1) }}°C
                                                </span>
                                            </template>
                                            <span>
                                                {{ $t('Panels.TemperaturePanel.Max') }}:
                                                {{ object.measured_max_temp }}°C
                                                <br />
                                                {{ $t('Panels.TemperaturePanel.Min') }}:
                                                {{ object.measured_min_temp }}°C
                                            </span>
                                        </v-tooltip>
                                        <div v-for="(values, key) of object.additionSensors" :key="key">
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
                                            :attribute-name="object.commandAttributeName"></temperature-input>
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </template>
                </responsive>
            </v-card-text>
            <v-card-text v-if="boolTempchart" class="pa-0 d-inline-block">
                <v-divider class="mt-0 mb-2"></v-divider>
                <v-row>
                    <v-col class="py-0">
                        <temp-chart></temp-chart>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
        <!-- COLOR-PICKER -->
        <v-dialog v-model="editHeater.bool" persistent :width="400">
            <panel
                :title="convertName(editHeater.name)"
                :icon="editHeater.icon"
                card-class="temperature-edit-heater-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="editHeater.bool = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pt-6">
                    <v-row v-for="dataset in editHeater.chartSeries" :key="dataset">
                        <v-col class="col-12 py-1">
                            <v-checkbox
                                v-model="editHeater['bool' + dataset.charAt(0).toUpperCase() + dataset.slice(1)]"
                                :label="
                                    $t('Panels.TemperaturePanel.ShowNameInChart', {
                                        name: $t(`Panels.TemperaturePanel.Dataset.${capitalize(dataset)}`),
                                    })
                                "
                                hide-details
                                class="mt-0"
                                @change="setVisible(dataset)"></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row v-for="key in Object.keys(editHeater.additionSensors)" :key="key">
                        <v-col class="col-12 py-1">
                            <v-checkbox
                                v-model="editHeater.additionSensors[key]['bool']"
                                :label="$t('Panels.TemperaturePanel.ShowNameInList', { name: key })"
                                hide-details
                                class="mt-0"
                                @change="setVisibleAdditionalSensor(key)"></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="col-12 text-center pb-0">
                            <v-color-picker
                                hide-mode-switch
                                mode="hexa"
                                :value="editHeater.color"
                                class="mx-auto"
                                @update:color="setChartColor"></v-color-picker>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import { capitalize, convertName } from '@/plugins/helpers'
import { Debounce } from 'vue-debounce-decorator'
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { PrinterStateTemperatureObject } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import TempChart from '@/components/charts/TempChart.vue'
import TemperatureInput from '@/components/inputs/TemperatureInput.vue'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'
import { mdiCloseThick, mdiCog, mdiFan, mdiSnowflake, mdiFire, mdiMenuDown, mdiThermometerLines } from '@mdi/js'

@Component({
    components: { Panel, TempChart, TemperatureInput, Responsive },
})
export default class TemperaturePanel extends Mixins(BaseMixin, ControlMixin) {
    mdiFan = mdiFan
    mdiSnowflake = mdiSnowflake
    mdiCloseThick = mdiCloseThick
    mdiCog = mdiCog
    mdiFire = mdiFire
    mdiMenuDown = mdiMenuDown
    mdiThermometerLines = mdiThermometerLines

    convertName = convertName
    capitalize = capitalize

    private editHeater: any = {
        bool: false,
        name: '',
        icon: '',
        boolTemperature: false,
        boolTarget: false,
        boolPower: false,
        boolSpeed: false,
        additionSensors: {},
        color: '',
    }

    get presets(): GuiPresetsStatePreset[] {
        return this.$store.getters['gui/presets/getPresets'] ?? []
    }

    get cooldownGcode(): string {
        return this.$store.getters['gui/presets/getCooldownGcode']
    }

    get boolTempchart(): boolean {
        return this.$store.state.gui.view.tempchart.boolTempchart ?? false
    }

    set boolTempchart(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.tempchart.boolTempchart', value: newVal })
    }

    get autoscaleTempchart(): boolean {
        return this.$store.state.gui.view.tempchart.autoscale ?? false
    }

    set autoscaleTempchart(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.tempchart.autoscale', value: newVal })
    }

    get temperatureObjects() {
        return this.$store.getters['printer/getTemperatureObjects'] ?? []
    }

    preheat(preset: GuiPresetsStatePreset): void {
        for (const [name, attributes] of Object.entries(preset.values)) {
            if (attributes.bool) {
                let gcode = `SET_HEATER_TEMPERATURE HEATER=${name} TARGET=${attributes.value}`

                if (attributes.type === 'temperature_fan') {
                    const fanName = name.replace('temperature_fan ', '')
                    gcode = `SET_TEMPERATURE_FAN_TARGET temperature_fan=${fanName} TARGET=${attributes.value}`
                }

                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }
        }

        if (preset.gcode !== '') {
            setTimeout(() => {
                this.$store.dispatch('server/addEvent', { message: preset.gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: preset.gcode })
            }, 100)
        }
    }

    cooldown(): void {
        this.$store.dispatch('server/addEvent', { message: this.cooldownGcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.cooldownGcode })
    }

    openHeater(object: PrinterStateTemperatureObject): void {
        this.editHeater.name = object.name
        this.editHeater.icon = object.icon

        this.editHeater.color = object.chartColor
        this.editHeater.chartSeries = 'chartSeries' in object ? object.chartSeries : []
        this.editHeater.boolTemperature = this.$store.getters['gui/getDatasetValue']({
            name: object.name,
            type: 'temperature',
        })
        this.editHeater.boolTarget = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'target' })
        this.editHeater.boolPower = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'power' })
        this.editHeater.boolSpeed = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'speed' })
        this.editHeater.additionSensors = object.additionSensors

        this.editHeater.bool = true
    }

    setVisible(type: string): void {
        const serieName = 'bool' + type.charAt(0).toUpperCase() + type.slice(1)
        const value = this.editHeater[serieName]

        const name = 'view.tempchart.datasetSettings.' + this.editHeater.name + '.' + type
        this.$store.dispatch('gui/saveSetting', { name, value })
    }

    setVisibleAdditionalSensor(sensor: string): void {
        const name = 'view.tempchart.datasetSettings.' + this.editHeater.name + '.additionalSensors.' + sensor
        this.$store.dispatch('gui/saveSetting', { name, value: this.editHeater.additionSensors[sensor].bool })
    }

    @Debounce(500)
    setChartColor(value: string | any): void {
        if (typeof value === 'object' && 'hex' in value) value = value.hex
        this.$store.commit('printer/tempHistory/setColor', { name: this.editHeater.name, value: value })

        const name = 'view.tempchart.datasetSettings.' + this.editHeater.name + '.color'
        this.$store.dispatch('gui/saveSetting', { name, value })
    }
}
</script>

<style scoped>
.canvasjs-chart-tooltip > div {
    border-radius: 10px !important;
}

._preset-title {
    font-size: 0.8125rem;
    font-weight: 500;
}

.v-icon._no-focus-style:focus::after {
    opacity: 0 !important;
}

.temperature-panel-table th,
.temperature-panel-table td {
    padding-top: 5px !important;
    padding-bottom: 5px !important;
    height: auto !important;
}

.temperature-panel-table tr:hover {
    background: none !important;
}

.temperature-panel-table .icon {
    width: 24px;
    padding-right: 0 !important;
    text-align: center;
}

.temperature-panel-table .state {
    width: 100px;
    text-align: right !important;
}

.temperature-panel-table .current {
    width: 100px;
    text-align: right !important;
}

.temperature-panel-table .target {
    width: 140px;
}
</style>
