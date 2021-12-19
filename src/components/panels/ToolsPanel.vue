<style scoped>
    .heater-row .vertical_align_center {
        margin: auto 0;
    }

    .colHeaterIcons {
        width: 68px;
    }

    .canvasjs-chart-tooltip>div {
        border-radius: 10px !important;
    }

    .datasetColorSymbol {
        width: 8px;
        height: 8px;
        border-style: solid;
        border-width: 0px;
        cursor: pointer;
        border-radius: 50%;
    }

</style>

<template>
    <panel
        v-if="klipperReadyForGui"
        icon="mdi-thermometer-lines"
        :title="$t('Panels.ToolsPanel.Headline')"
        :collapsible="true"
        card-class="tools-panel"
    >
        <template v-slot:buttons>
            <v-menu :offset-y="true" title="Preheat" v-if="presets.length">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        text
                        tile
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                        :disabled="['printing', 'paused'].includes(printer_state)"
                        class="pa-1"
                    >
                        <span class="d-none ml-1 d-md-block">{{ $t("Panels.ToolsPanel.Presets") }}</span>
                        <v-icon class="d-md-none">mdi-fire</v-icon>
                        <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                </template>
                <v-list dense class="py-0">
                    <v-list-item v-for="preset of presets" v-bind:key="preset.index" link @click="preheat(preset)">
                        <v-list-item-icon class="mr-0">
                            <v-icon small>mdi-fire</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title v-text="preset.name"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
                <v-divider></v-divider>
                <v-list dense class="py-0">
                    <v-list-item link @click="cooldown()">
                        <v-list-item-icon class="mr-0">
                            <v-icon small color="primary">mdi-snowflake</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title class="primary--text">{{ $t("Panels.ToolsPanel.Cooldown") }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn
                :icon="$vuetify.breakpoint.smAndDown"
                :text="$vuetify.breakpoint.mdAndUp"
                tile
                @click="cooldown()"
                v-if="presets.length === 0"
                color="primary"
            >
                <v-icon small>mdi-snowflake</v-icon><span class="d-none ml-1 d-md-inline">{{ $t("Panels.ToolsPanel.Cooldown") }}</span>
            </v-btn>
            <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.ToolsPanel.SetupTemperatures')">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on"><v-icon small>mdi-cog</v-icon></v-btn>
                </template>
                <v-list>
                    <v-list-item class="minHeight36">
                        <v-checkbox class="mt-0" v-model="boolTempchart" hide-details :label="$t('Panels.ToolsPanel.ShowChart')"></v-checkbox>
                    </v-list-item>
                    <v-list-item class="minHeight36">
                        <v-checkbox class="mt-0" v-model="autoscaleTempchart" hide-details :label="$t('Panels.ToolsPanel.AutoscaleChart')"></v-checkbox>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
        <v-card-text class="pa-0 content">
            <v-container class="px-0">
                <v-row align="center">
                    <v-col class="py-2 font-weight-bold" style="padding-left: 68px;">{{ $t("Panels.ToolsPanel.Name") }}</v-col>
                    <v-col class="py-2 text-center flex-grow-0 font-weight-bold d-none d-md-block" v-if="boolTempchart" style="min-width: 75px;">{{ $t("Panels.ToolsPanel.Color") }}</v-col>
                    <v-col class="py-2 text-center font-weight-bold d-none d-md-block">{{ $t("Panels.ToolsPanel.State") }}</v-col>
                    <v-col class="py-2 text-center font-weight-bold">{{ $t("Panels.ToolsPanel.Current") }}</v-col>
                    <v-col class="py-2 pr-8 text-center font-weight-bold">{{ $t("Panels.ToolsPanel.Target") }}</v-col>
                </v-row>
                <div v-for="(heater, index) in heaters" v-bind:key="index" >
                    <v-divider class="my-2"></v-divider>
                    <v-row align="center">
                        <v-col class="pl-8 pr-0 flex-grow-0 py-2 colHeaterIcons">
                            <v-icon :color="heater.iconColor">mdi-{{ heater.icon }}</v-icon>
                        </v-col>
                        <v-col class="py-2 font-weight-bold"><span style="cursor: pointer;" @click="openHeater(heater)">{{ convertName(heater.name) }}</span></v-col>
                        <v-col class="py-2 flex-grow-0 text-center d-none d-md-block" v-if="boolTempchart" style="min-width: 75px;">
                            <div :style="'background-color: '+heater.chartColor+'cc;'" class="datasetColorSymbol d-inline-block" @click="openHeater(heater)"></div>
                        </v-col>
                        <v-col class="py-2 text-center d-none d-md-block">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <small v-bind="attrs" v-on="on">{{ heater.target > 0 ? heater.power+'%' : "off" }}</small>
                                </template>
                                <span>{{ $t("Panels.ToolsPanel.Avg") }}: {{ heater.avgPower+'%' }}</span>
                            </v-tooltip>
                        </v-col>
                        <v-col class="py-2 text-center">
                            <span class="d-block">{{ heater.temperature.toFixed(1) }}°C</span>
                            <div v-for="(values, key) of heater.additionSensors" v-bind:key="key">
                                <span v-if="values.bool" class="d-block"><small>{{ values.value }} {{ values.unit }}</small></span>
                            </div>
                        </v-col>
                        <v-col class="text-center py-2 pr-8 vertical_align_center">
                            <tool-input
                                :name="heater.name"
                                :target="heater.target"
                                :min_temp="heater.min_temp"
                                :max_temp="heater.max_temp"
                                :items="heater.presets"
                                command="SET_HEATER_TEMPERATURE"
                                attribute-name="HEATER"
                            ></tool-input>
                        </v-col>
                    </v-row>
                </div>
                <div v-for="(fan, index) in temperatureFans" v-bind:key="index+99" >
                    <v-divider class="my-2"></v-divider>
                    <v-row align="center">
                        <v-col class="flex-grow-0 py-2 pl-8 pr-0  colHeaterIcons">
                            <v-icon :color="(fan.target ? 'grey lighten-5' : 'grey darken-2')" :class="(fan.speed ? ' icon-rotate' : '')">mdi-fan</v-icon>
                        </v-col>
                        <v-col class="py-2 font-weight-bold"><span style="cursor: pointer;" @click="openHeater(fan)">{{ convertName(fan.name) }}</span></v-col>
                        <v-col class="py-2 flex-grow-0 text-center d-none d-md-block" v-if="boolTempchart" style="min-width: 75px;">
                            <div :style="'background-color: '+fan.chartColor+'cc;'" class="datasetColorSymbol d-inline-block" @click="openHeater(fan)"></div>
                        </v-col>
                        <v-col class="py-2 text-center d-none d-md-block">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <small class="d-block" v-bind="attrs" v-on="on">{{ fan.target > 0 && fan.speed > 0 ? fan.speed+"%" : (fan.target > 0 ? "standby" : "off") }}</small>
                                </template>
                                <span>{{ $t("Panels.ToolsPanel.Avg") }}: {{ fan.avgSpeed+'%' }}</span>
                            </v-tooltip>
                        </v-col>
                        <v-col class="py-2 text-center">
                            <span class="d-block">{{ fan.temperature.toFixed(1) }}°C</span>
                            <div v-for="(values, key) of fan.additionSensors" v-bind:key="key">
                                <span v-if="values.bool" class="d-block"><small>{{ values.value }} {{ values.unit }}</small></span>
                            </div>
                            <small v-if="fan.rpm !== null" :class="'d-block ' + (fan.rpm === 0 && fan.speed > 0 ? 'red--text' : '')">{{ fan.rpm }} RPM</small>
                        </v-col>
                        <v-col class="text-center py-2 pr-8 pr-0  vertical_align_center">
                            <tool-input
                                :name="fan.name"
                                :target="fan.target"
                                :min_temp="fan.min_temp"
                                :max_temp="fan.max_temp"
                                :items="fan.presets"
                                command="SET_TEMPERATURE_FAN_TARGET"
                                attribute-name="temperature_fan"
                            ></tool-input>
                        </v-col>
                    </v-row>
                </div>
                <div v-for="(sensor,index) in temperatureSensors" v-bind:key="index+999">
                    <v-divider class="my-2"></v-divider>
                    <v-row align="center">
                        <v-col class="flex-grow-0 py-2 pl-8 pr-0 colHeaterIcons">
                            <v-icon color="grey darken-2" :title="$t('Panels.ToolsPanel.Min')+': '+sensor.min_temp+'° / ' + $t('Panels.ToolsPanel.Max')+': '+sensor.max_temp+'°'">mdi-{{ sensor.icon }}</v-icon>
                        </v-col>
                        <v-col class="py-2 font-weight-bold">
                            <span style="cursor: pointer;" @click="openHeater(sensor)">{{ convertName(sensor.name) }}</span>
                        </v-col>
                        <v-col class="py-2 flex-grow-0 text-center d-none d-md-block" v-if="boolTempchart" style="min-width: 75px;">
                            <div :style="'background-color: '+sensor.chartColor+'CC;'" class="datasetColorSymbol d-inline-block" @click="openHeater(sensor)"></div>
                        </v-col>
                        <v-col class="py-2 d-none d-md-block"><span>&nbsp;</span></v-col>
                        <v-col class="py-2 text-center">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                  <span
                                      style="cursor: default;"
                                      class="d-block px-0"
                                      v-bind="attrs"
                                      v-on="on"
                                  >{{ sensor.temperature.toFixed(1) }}°C</span>
                                </template>
                                <span>{{ $t('Panels.ToolsPanel.Max')}}: {{ sensor.measured_max_temp }}°C<br />{{ $t('Panels.ToolsPanel.Min') }}: {{ sensor.measured_min_temp }}°C</span>
                            </v-tooltip>
                            <div v-for="(values, key) of sensor.additionSensors" v-bind:key="key">
                                <span v-if="values.bool" class="d-block"><small>{{ values.value }} {{ values.unit }}</small></span>
                            </div>
                        </v-col>
                        <v-col class="text-center py-2 pr-8 vertical_align_center"><span>&nbsp;</span></v-col>
                    </v-row>
                </div>
                <v-divider class="my-2" v-if="boolTempchart"></v-divider>
                <v-row v-if="boolTempchart">
                    <v-col class="py-0 px-3">
                        <temp-chart></temp-chart>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-dialog v-model="editHeater.bool" persistent :width="400">
            <panel :title="convertName(editHeater.name)" :icon="'mdi-'+editHeater.icon" card-class="tools-edit-heater-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="editHeater.bool = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="pt-6">
                    <v-row v-for="dataset in editHeater.chartSeries" v-bind:key="dataset">
                        <v-col class="col-12 py-1">
                            <v-checkbox
                                v-model="editHeater['bool' + dataset.charAt(0).toUpperCase() + dataset.slice(1)]"
                                :label="$t('Panels.ToolsPanel.ShowNameInChart', {name: $t('Panels.ToolsPanel.Dataset.'+dataset.charAt(0).toUpperCase() + dataset.slice(1))})"
                                hide-details
                                class="mt-0"
                                @change="setVisible(dataset)"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row v-for="key in Object.keys(editHeater.additionSensors)" v-bind:key="key">
                        <v-col class="col-12 py-1">
                            <v-checkbox
                                v-model="editHeater.additionSensors[key]['bool']"
                                :label="$t('Panels.ToolsPanel.ShowNameInList', {name: key})"
                                hide-details
                                class="mt-0"
                                @change="setVisibleAdditionalSensor(key)"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="col-12 text-center pb-0">
                            <v-color-picker
                                hide-mode-switch
                                mode="hexa"
                                :value="editHeater.color"
                                @update:color="setChartColor"
                                class="mx-auto"
                            ></v-color-picker>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </panel>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { convertName } from '@/plugins/helpers'
import ToolInput from '@/components/inputs/ToolInput.vue'
import TempChart from '@/components/charts/TempChart.vue'
import {datasetTypes} from '@/store/variables'
import {PrinterStateHeater, PrinterStateSensor, PrinterStateTemperatureFan} from '@/store/printer/types'
import {Debounce} from 'vue-debounce-decorator'
import Panel from '@/components/ui/Panel.vue'
import {GuiPresetsStatePreset} from '@/store/gui/presets/types'

@Component({
    components: {Panel, TempChart, ToolInput}
})
export default class ToolsPanel extends Mixins(BaseMixin) {
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
                let gcode = 'SET_HEATER_TEMPERATURE HEATER='+name+' TARGET='+attributes.value

                if (attributes.type === 'temperature_fan') {
                    const fanName = name.replace('temperature_fan ', '')
                    gcode = 'SET_TEMPERATURE_FAN_TARGET temperature_fan='+fanName+' TARGET='+attributes.value
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
        this.editHeater.boolTemperature = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'temperature' })
        this.editHeater.boolTarget = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'target' })
        this.editHeater.boolPower = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'power' })
        this.editHeater.boolSpeed = this.$store.getters['gui/getDatasetValue']({ name: object.name, type: 'speed' })
        this.editHeater.additionSensors = object.additionSensors

        this.editHeater.bool = true
    }

    setVisible(type: string): void {
        const serieName = 'bool'+type.charAt(0).toUpperCase() + type.slice(1)
        const value = this.editHeater[serieName]

        const name = 'view.tempchart.datasetSettings.'+this.editHeater.name+'.'+type
        this.$store.dispatch('gui/saveSetting', { name, value })
    }

    setVisibleAdditionalSensor(sensor: string): void {
        const name = 'view.tempchart.datasetSettings.'+this.editHeater.name+'.additionalSensors.'+sensor
        this.$store.dispatch('gui/saveSetting', { name, value: this.editHeater.additionSensors[sensor].bool })
    }

    @Debounce(500)
    setChartColor(value: string | any): void {
        if (typeof value === 'object' && 'hex' in value) value = value.hex
        this.$store.commit('printer/tempHistory/setColor', { name: this.editHeater.name, value: value })

        const name = 'view.tempchart.datasetSettings.'+this.editHeater.name+'.color'
        this.$store.dispatch('gui/saveSetting', { name, value })
    }


}
</script>