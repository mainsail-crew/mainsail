<template>
    <div>
        <panel
            v-if="klipperReadyForGui"
            :icon="mdiThermometerLines"
            :title="$t('Panels.TemperaturePanel.Headline')"
            :collapsible="true"
            card-class="temperature-panel">
            <!-- PRESET MENU -->
            <template #buttons>
                <temperature-panel-presets />
                <temperature-panel-settings />
            </template>
            <v-card-text class="pa-0">
                <responsive
                    :breakpoints="{
                        mobile: (el) => el.width <= 395,
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
                                            :attribute-name="object.commandAttributeName"></temperature-input>
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </template>
                </responsive>
            </v-card-text>
            <v-card-text v-if="boolTempchart" class="pa-0 d-inline-block">
                <v-divider class="mt-0 mb-2" />
                <v-row>
                    <v-col class="py-0">
                        <temp-chart />
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
                    <v-row v-for="additionalSensor in editHeater.additionalSensors" :key="additionalSensor.name">
                        <v-col class="col-12 py-1">
                            <v-checkbox
                                v-model="additionalSensor.bool"
                                :label="$t('Panels.TemperaturePanel.ShowNameInList', { name: additionalSensor.name })"
                                hide-details
                                class="mt-0"
                                @change="setVisibleAdditionalSensor(additionalSensor)"></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="col-12 text-center pb-0">
                            <v-color-picker
                                hide-mode-switch
                                mode="hexa"
                                :value="editHeater.color"
                                class="mx-auto"
                                @update:color="setChartColor" />
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
import { PrinterStateAdditionalSensor, PrinterStateTemperatureObject } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import TempChart from '@/components/charts/TempChart.vue'
import TemperatureInput from '@/components/inputs/TemperatureInput.vue'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'
import { mdiCloseThick, mdiCog, mdiThermometerLines } from '@mdi/js'
import TemperaturePanelPresets from '@/components/panels/Temperature/TemperaturePanelPresets.vue'

@Component({
    components: { Panel, TempChart, TemperatureInput, Responsive, TemperaturePanelPresets },
})
export default class TemperaturePanel extends Mixins(BaseMixin, ControlMixin) {
    mdiCloseThick = mdiCloseThick
    mdiCog = mdiCog
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
        additionalSensors: {},
        color: '',
    }

    get boolTempchart(): boolean {
        return this.$store.state.gui.view.tempchart.boolTempchart ?? false
    }

    get temperatureObjects() {
        const sensors = this.$store.getters['printer/getTemperatureObjects'] ?? []

        return sensors.filter((sensor: PrinterStateTemperatureObject) => !sensor.name.startsWith('_'))
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
        this.editHeater.additionalSensors = object.additionalSensors

        this.editHeater.bool = true
    }

    setVisible(type: string): void {
        const serieName = 'bool' + type.charAt(0).toUpperCase() + type.slice(1)
        const value = this.editHeater[serieName]

        const name = 'view.tempchart.datasetSettings.' + this.editHeater.name + '.' + type
        this.$store.dispatch('gui/saveSetting', { name, value })
    }

    setVisibleAdditionalSensor(sensor: PrinterStateAdditionalSensor): void {
        const name = 'view.tempchart.datasetSettings.' + this.editHeater.name + '.additionalSensors.' + sensor.name
        this.$store.dispatch('gui/saveSetting', { name, value: sensor.bool })
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

/*
workaround for fixing a transparency issue
which is assumingly a vuetify bug
*/
._fix_transparency {
    background-color: #1e1e1e;
}
</style>
