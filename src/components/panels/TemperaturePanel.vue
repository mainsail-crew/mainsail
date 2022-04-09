<style scoped>
.heater-row .vertical_align_center {
    margin: auto 0;
}

.canvasjs-chart-tooltip > div {
    border-radius: 10px !important;
}

._preset-title {
    font-size: 0.8125rem;
    font-weight: 500;
}

._column-title {
    text-align: center;
    font-weight: bold;
}

._column-name {
    padding-left: 22px;
}

._column-input {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    padding-top: 8px;
    padding-bottom: 8px;
}
</style>

<template>
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
        <v-card-text class="px-0 py-2">
            <v-row align="center">
                <v-col class="font-weight-bold">
                    <span style="padding-left: 58px">
                        {{ $t('Panels.TemperaturePanel.Name') }}
                    </span>
                </v-col>
                <v-col class="_column-title">
                    {{ $t('Panels.TemperaturePanel.State') }}
                </v-col>
                <v-col class="_column-title">
                    {{ $t('Panels.TemperaturePanel.Current') }}
                </v-col>
                <v-col class="_column-title">
                    {{ $t('Panels.TemperaturePanel.Target') }}
                </v-col>
            </v-row>
            <!-- HEATER -->
            <div v-for="(heater, index) in heaters" :key="index">
                <v-divider class="my-2"></v-divider>
                <v-row align="center">
                    <!-- HEATER NAME COLUMN -->
                    <v-col class="py-2 d-flex align-center">
                        <div class="_column-name">
                            <v-icon :color="heater.target > 0 ? `${heater.chartColor}aa` : `${heater.chartColor}22`">
                                {{ heater.icon }}
                            </v-icon>
                            <span class="pl-2" style="cursor: pointer" @click="openHeater(heater)">
                                {{ convertName(heater.name) }}
                            </span>
                        </div>
                    </v-col>
                    <!-- HEATER STATE COLUMN -->
                    <v-col class="py-2 text-center">
                        <v-tooltip top>
                            <template #activator="{ on, attrs }">
                                <small v-bind="attrs" v-on="on">
                                    {{ heater.target > 0 ? heater.power + '%' : 'off' }}
                                </small>
                            </template>
                            <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ heater.avgPower + '%' }}</span>
                        </v-tooltip>
                    </v-col>
                    <!-- HEATER CURRENT COLUMN -->
                    <v-col class="py-2 text-center">
                        <span class="d-block">{{ heater.temperature.toFixed(1) }}°C</span>
                        <div v-for="(values, key) of heater.additionSensors" :key="key">
                            <span v-if="values.bool" class="d-block">
                                <small>{{ values.value }} {{ values.unit }}</small>
                            </span>
                        </div>
                    </v-col>
                    <!-- HEATER TARGET INPUT COLUMN -->
                    <v-col class="_column-input d-flex align-center justify-space-around">
                        <div class="pr-3 d-flex align-center">
                            <div class="pr-1">
                                <temperature-input
                                    :name="heater.name"
                                    :target="heater.target"
                                    :presets="heater.presets"
                                    :min_temp="heater.min_temp"
                                    :max_temp="heater.max_temp"
                                    command="SET_HEATER_TEMPERATURE"
                                    attribute-name="HEATER"></temperature-input>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>
            <!-- TEMPERATURE FANS -->
            <div v-for="(fan, index) in temperatureFans" :key="index + 99">
                <v-divider class="my-2"></v-divider>
                <v-row align="center">
                    <!-- TEMPERATURE FANS NAME COLUMN -->
                    <v-col class="py-2 d-flex align-center">
                        <div class="_column-name">
                            <v-icon
                                :color="fan.target ? `${fan.chartColor}aa` : `${fan.chartColor}22`"
                                :class="fan.speed ? ' icon-rotate' : ''">
                                {{ mdiFan }}
                            </v-icon>
                            <span class="pl-2" style="cursor: pointer" @click="openHeater(fan)">
                                {{ convertName(fan.name) }}
                            </span>
                        </div>
                    </v-col>
                    <!-- TEMPERATURE FANS STATE COLUMN -->
                    <v-col class="py-2 text-center">
                        <v-tooltip top>
                            <template #activator="{ on, attrs }">
                                <small class="d-block" v-bind="attrs" v-on="on">
                                    {{
                                        fan.target > 0 && fan.speed > 0
                                            ? fan.speed + '%'
                                            : fan.target > 0
                                            ? 'standby'
                                            : 'off'
                                    }}
                                </small>
                            </template>
                            <span>{{ $t('Panels.TemperaturePanel.Avg') }}: {{ fan.avgSpeed + '%' }}</span>
                        </v-tooltip>
                    </v-col>
                    <!-- TEMPERATURE FANS CURRENT COLUMN -->
                    <v-col class="py-2 text-center">
                        <span class="d-block">{{ fan.temperature.toFixed(1) }}°C</span>
                        <div v-for="(values, key) of fan.additionSensors" :key="key">
                            <span v-if="values.bool" class="d-block">
                                <small>{{ values.value }} {{ values.unit }}</small>
                            </span>
                        </div>
                        <small
                            v-if="fan.rpm !== null"
                            :class="'d-block ' + (fan.rpm === 0 && fan.speed > 0 ? 'red--text' : '')">
                            {{ fan.rpm }} RPM
                        </small>
                    </v-col>
                    <!-- TEMPERATURE FANS TARGET INPUT COLUMN -->
                    <v-col class="_column-input d-flex justify-space-around">
                        <div class="pr-3 d-flex align-center">
                            <div class="pr-1">
                                <temperature-input
                                    :name="fan.name"
                                    :target="fan.target"
                                    :presets="fan.presets"
                                    :min_temp="fan.min_temp"
                                    :max_temp="fan.max_temp"
                                    command="SET_TEMPERATURE_FAN_TARGET"
                                    attribute-name="temperature_fan"></temperature-input>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>
            <!-- TEMPERATURE SENSORS -->
            <div v-for="(sensor, index) in temperatureSensors" :key="index + 999">
                <v-divider class="my-2"></v-divider>
                <v-row align="center">
                    <!-- TEMPERATURE SENSORS NAME COLUMN -->
                    <v-col class="py-2 d-flex align-center">
                        <div class="_column-name">
                            <v-icon
                                :color="`${sensor.chartColor}aa`"
                                :title="`${$t('Panels.TemperaturePanel.Min')}: ${sensor.min_temp}° / ${$t(
                                    'Panels.TemperaturePanel.Max'
                                )}: ${sensor.max_temp}°`">
                                {{ sensor.icon }}
                            </v-icon>
                            <span class="pl-2" style="cursor: pointer" @click="openHeater(sensor)">
                                {{ convertName(sensor.name) }}
                            </span>
                        </div>
                    </v-col>
                    <!-- TEMPERATURE SENSORS STATE COLUMN -->
                    <v-col class="py-2"><span>&nbsp;</span></v-col>
                    <!-- TEMPERATURE SENSORS CURRENT COLUMN -->
                    <v-col class="py-2 text-center">
                        <v-tooltip top>
                            <template #activator="{ on, attrs }">
                                <span style="cursor: default" class="d-block px-0" v-bind="attrs" v-on="on">
                                    {{ sensor.temperature.toFixed(1) }}°C
                                </span>
                            </template>
                            <span>
                                {{ $t('Panels.TemperaturePanel.Max') }}: {{ sensor.measured_max_temp }}°C
                                <br />
                                {{ $t('Panels.TemperaturePanel.Min') }}: {{ sensor.measured_min_temp }}°C
                            </span>
                        </v-tooltip>
                        <div v-for="(values, key) of sensor.additionSensors" :key="key">
                            <span v-if="values.bool" class="d-block">
                                <small>{{ values.value }} {{ values.unit }}</small>
                            </span>
                        </div>
                    </v-col>
                    <!-- TEMPERATURE SENSORS TARGET COLUMN -->
                    <v-col class="text-center py-2 vertical_align_center"><span>&nbsp;</span></v-col>
                </v-row>
            </div>
            <template v-if="boolTempchart">
                <v-divider class="my-2"></v-divider>
                <v-row>
                    <v-col class="py-0">
                        <temp-chart></temp-chart>
                    </v-col>
                </v-row>
            </template>
        </v-card-text>
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
                                        name: $t(
                                            'Panels.TemperaturePanel.Dataset.' +
                                                dataset.charAt(0).toUpperCase() +
                                                dataset.slice(1)
                                        ),
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
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import { convertName } from '@/plugins/helpers'
import { Debounce } from 'vue-debounce-decorator'
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { PrinterStateHeater, PrinterStateSensor, PrinterStateTemperatureFan } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import TempChart from '@/components/charts/TempChart.vue'
import TemperatureInput from '@/components/inputs/TemperatureInput.vue'
import Panel from '@/components/ui/Panel.vue'
import { datasetTypes } from '@/store/variables'
import { mdiCloseThick, mdiCog, mdiFan, mdiSnowflake, mdiFire, mdiMenuDown, mdiThermometerLines } from '@mdi/js'

@Component({
    components: { Panel, TempChart, TemperatureInput },
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
    datasetTypes = datasetTypes

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

    get heaters(): PrinterStateHeater[] {
        return this.$store.getters['printer/getHeaters'] ?? []
    }

    get temperatureFans(): PrinterStateTemperatureFan {
        return this.$store.getters['printer/getTemperatureFans']
    }

    get temperatureSensors(): PrinterStateSensor {
        return this.$store.getters['printer/getTemperatureSensors']
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

    openHeater(object: PrinterStateHeater | PrinterStateTemperatureFan | PrinterStateSensor): void {
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
